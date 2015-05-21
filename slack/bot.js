"use strict";

var Slack = require("slack-client");

module.exports = class Bot {
  constructor(token) {
    this.slack = new Slack(token, true, true);
    this.commands = [];

    this.slack.on("open", () => this.name = this.slack.self.name);

    this.slack.on("message", message => {
      if (message.type == "message" && message.text) {
        for (var command of this.commands) {
          var match = message.text.match(command.pattern);
          if (match) {
            command.action.apply(null, [message].concat(match.slice(1)));
            break;
          }
        }
      }
    });
  }

  when(pattern, action) {
    this.commands.push({ pattern: pattern, action: action });
    return this;
  }

  postMessage(message, channelId) {
    var channel = this.slack.getChannelGroupOrDMByID(channelId);
    channel.send(message);
  }

  postMeme(meme, channelId) {
    var channel = this.slack.getChannelGroupOrDMByID(channelId);

    channel.postMessage({
      as_user: true,
      username: this.name,
      attachments: [{
        title: meme,
        image_url: this.memeUrl(meme)
      }]
    });
  }

  postDiff(diffUpdate) {
    [
      diffUpdate.user.userName,
      diffUpdate.diff.author.userName
    ].concat(diffUpdate.diff.reviewers.map((u) => u.userName))
     .filter((u) => u != diffUpdate.user.userName)
     .map((userName) => this.slack.getDMByName(userName))
     .filter((dm) => dm != null)
     .forEach((dm) => {
       dm.postMessage({
         as_user: true,
         username: this.name,
         attachments: [{
           title: "D" + diffUpdate.diff.id,
           title_link: diffUpdate.diff.url,
           fallback: diffUpdate.text,
           text: diffUpdate.text,
           fields: [{
             title: "Title",
             value: diffUpdate.diff.title,
             short: true
           }, {
             title: "Status",
             value: diffUpdate.diff.status,
             short: true
           }]
         }]
       });
     });
  }

  start(callback) {
    if (callback) this.slack.once("open", () => callback(this.slack.self.name));
    this.slack.login();
  }
}
