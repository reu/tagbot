"use strict";

if (process.env.NODE_ENV != "production") require("dotenv").load({ silent: true });

var APP_URL = process.env.APP_URL;
var BOT_TOKEN = process.env.BOT_TOKEN;
var PHABRICATOR_URL = process.env.PHABRICATOR_URL;
var PHABRICATOR_DB_URL = process.env.PHABRICATOR_DB_URL;
var PHABRICATOR_S3_BUCKET = process.env.PHABRICATOR_S3_BUCKET;
var AWS_KEY_ID = process.env.AWS_KEY_ID;
var AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;
var SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

var express = require("express");
var urljoin = require("url-join");
var request = require("request");
var cowsay = require("cowsay");
var log = console.log;

var MemeRepository = require("./meme/phabricator/repository");
var MemeDownloader = require("./meme/phabricator/downloader");
var VoteRepository = require("./vote/repository");
var Bot = require("./slack/bot");

var memeDownloader = new MemeDownloader(PHABRICATOR_S3_BUCKET, AWS_KEY_ID, AWS_SECRET_ACCESS_KEY);
var memeRepository = new MemeRepository(PHABRICATOR_DB_URL, memeDownloader);
var voteRepository = new VoteRepository();
var bot = new Bot(BOT_TOKEN);

// Pool upvote
// ex: +sauce
bot.when(/^\+(.+)$/, (message, subject) => {
  log("Upvote", subject, message.user);
  voteRepository.upVote(subject, message.user);
});

// Pool downvote
// ex: -cry
bot.when(/^\-(.+)$/, (message, subject) => {
  log("Downvote", subject, message.user);
  voteRepository.downVote(subject, message.user);
});

// Pool leaderboard
// ex: ?cats
bot.when(/^\?(.+)$/, (message, subject) => {
  log("Leaderboard for", subject);

  voteRepository.votesForSubject(subject).then(votes => {
    log(subject, votes.up.length, votes.down.length);
    bot.postMessage(subject + " tem " + votes.up.length + " votos a favor e " + votes.down.length + " contra.", message.channel);
  }, () => {
    log(subject, " not found");
    bot.postMessage("Ninguém votou na enquete \"" + subject + "\" ainda...", message.channel);
  });
});

// Diff URL
// ex: Could someone review D2015?
bot.when(/\b(D\d+)\b/, (message, diff) => {
  log("Generating diff URL for", diff);
  bot.postMessage(urljoin(PHABRICATOR_URL, diff), message.channel);
});

// Meme!!11!
// ex: sashakiss
bot.when(/^([^\s]+)$/, (message, meme) => {
  memeRepository.findMeme(meme).then(() => {
    log("Meme", meme, "in a jorney for the lulz");
    bot.postMeme(meme, message.channel);
  }, () => {
    log("Meme " + meme + " not found");
  });
});

var app = express();

// Slack slash command /meme
app.get("/meme", (req, res) => {
  memeRepository.listMemes().then(memes => {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.write(memes.join("\n")).end();
  });
});

// Slack slash command /cowsay
app.get("/cowsay", (req, res) => {
  request({
    uri: SLACK_WEBHOOK_URL,
    method: "POST",
    json: {
      text: "```\n" + cowsay.say({ text: req.query.text }) + "\n```",
      channel: "#" + req.query.channel_name,
      username: "cow",
      icon_emoji: ":cow:"
    }
  });

  res.status(204).end();
});

var memePath = "/meme/:name";

app.get(memePath, (req, res) => {
  memeRepository.findMeme(req.params.name).then(meme => {
    meme.getImage().pipe(res);
  }, () => {
    res.status(404).end();
  });
});

// Let's teach the bot how to retrieve a meme
bot.memeUrl = function(meme) {
  return urljoin(APP_URL, memePath).replace(":name", meme);
}

var server = app.listen(process.env.PORT || 3000, () => {
  log("Server listening port", server.address().port);

  log("Time to wake up the engines")
  bot.start(name => log("Bot " + name + " up and running"));
});
