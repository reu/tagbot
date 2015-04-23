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

  start(callback) {
    if (callback) this.slack.once("open", () => callback(this.slack.self.name));
    this.slack.login();
  }
}
