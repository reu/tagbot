var Rx = require("rx");

module.exports = class PhabricatorNotificator {
  constructor(conduit) {
    this.conduit = conduit;
  }

  feed(delay = 1 * 1000) {
    return new Rx.Observable.create((observer) => {
      var interval = null;
      var fetching = false;

      this.conduit.call("feed.query", { limit: 1 }).then((lastFeed) => {
        var cursor = null;

        for (var feedId in lastFeed) {
          cursor = lastFeed[feedId].chronologicalKey;
        }

        var fetchDiffs = () => {
          if (fetching) return;
          fetching = true;

          this.fetchDiffFeed(cursor).then(function(notifications) {
            fetching = false;

            notifications.forEach((notification) => {
              if (notification.chronologicalKey > cursor) cursor = notification.chronologicalKey;
              observer.onNext(notification)
            });
          }).catch(function(error) {
            console.error(error);
            fetching = false;
          });
        }

        fetchDiffs();

        interval = setInterval(fetchDiffs, delay);
      });

      return function() {
        if (interval) clearInterval(interval);
      }
    });
  }

  fetchDiffFeed(chronologicalKey = 0) {
    return this.conduit.call("feed.query", { limit: 10, view: "text", before: chronologicalKey }).then((feed) => {
      var diffNotifications = [];

      for (var feedId in feed) {
        var story = feed[feedId];
        if (story.objectPHID && story.objectPHID.match(/DREV/)) {
          diffNotifications.push(story);
        }
      }

      return diffNotifications.map((notification) => {
        return {
          phid: notification.objectPHID,
          text: notification.text,
          date: new Date(notification.epoch * 1000),
          chronologicalKey: notification.chronologicalKey,
          user: notification.authorPHID
        }
      });
    }).then((notifications) => {
      return this.conduit.listDiffsByIds(notifications.map((n) => n.phid)).then((diffs) => {
        return notifications.map((notification) => {
          var diff = diffs.find((diff) => diff.phid == notification.phid);

          notification.diff = {
            id: diff.id,
            title: diff.title,
            status: diff.statusName,
            author: diff.authorPHID,
            reviewers: diff.reviewers,
            url: diff.uri
          }

          return notification;
        });
      });
    }).then((notifications) => {
      var userIds = notifications
        .map((n) => [n.user, n.diff.author].concat(n.diff.reviewers))
        .reduce((users, diffUsers) => users.concat(diffUsers), []);

      return this.conduit.listUsersByIds(userIds).then(function(users) {
        return notifications.map(function(n) {
          n.user = users.find((u) => u.phid == n.user);
          n.diff.author = users.find((u) => u.phid == n.diff.author);
          n.diff.reviewers = n.diff.reviewers.map((r) => users.find((u) => u.phid == r));
          return n;
        });
      });
    }).catch(function(error) {
      console.error(error.stack);
    });
  }
}
