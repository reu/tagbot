"use strict";

var UP_VOTE = "up";
var DOWN_VOTE = "down";

var normalizeSubject = subject => subject.toLowerCase();

module.exports = class VoteRepository {
  constructor(db) {
    this.db = {};
  }

  upVote(subject, user) {
    this.vote(subject, UP_VOTE, user);
  }

  downVote(subject, user) {
    this.vote(subject, DOWN_VOTE, user);
  }

  vote(subject, direction, user) {
    subject = normalizeSubject(subject);

    if (!this.db[subject]) this.db[subject] = {}
    this.db[subject][user] = direction;
  }

  votesForSubject(subject) {
    subject = normalizeSubject(subject);

    return new Promise((resolve, reject) => {
      if (this.db[subject]) {
        var upVotes = [];
        var downVotes = [];

        for (var user in this.db[subject]) {
          this.db[subject][user] == "up" ? upVotes.push(user) : downVotes.push(user);
        }

        resolve({ up: upVotes, down: downVotes });
      } else {
        reject();
      }
    });
  }

}
