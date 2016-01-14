/**
 * Slack
 * Copyright (c) 2016 app2641
 */

loadSlack = function () {
  var Slack = function (slack_url, template, settings) {
    EventListener.apply(this);
    this.slack_url = slack_url;
    this.template = template;
    this.settings = settings;
  };

  if (typeof EventListener === 'undefined') EventListener = loadEventListener();
  _.extend(Slack.prototype, EventListener.prototype);

  Slack.prototype.receiveMessage = function (message) {
    var username = String(message['user_name']);
    var body = String(message['text']);

    // #で始まるメッセージは無視
    if (body.match(/^(#|♯)/)) return;

    var user = this.settings.get('Users', username);
    if (user) {
      this.fireEvent('receiveMessage', username, body);
    }
  };

  Slack.prototype.send = function (message, options) {
    options = _.clone(options || {});
    options["text"] = message;

    var send_options = {
      method: "post",
      payload: {"payload": JSON.stringify(options)}
    };

    if (this.slack_url) {
      UrlFetchApp.fetch(this.slack_url, send_options);
    }

    return message;
  };

  Slack.prototype.template = function () {
    this.send(this.template.template.apply(this.template, arguments));
  };

  return Slack;
};

if (typeof exports !== 'undefined') {
  exports.Slack = loadSlack();
}
