/**
 * Runner
 * Copyright (c) 2016 app2641
 */

loadRunner = function (exports) {
  var Runner = function (settings, timesheets, templates, slack) {
    this.settings = settings;
    this.timesheets = timesheets;
    this.templates = templates;
    this.slack = slack;

    var self = this;
    this.slack.on('receiveMessage', function (username, message) {
      self.receiveMessage(username, message);
    });
  };

  Runner.prototype.receiveMessage = function (username, message) {
    this.date = DateUtils.parseDate(message);
    this.time = DateUtils.parseTime(message);

    var commands = [
      ['attendance', /(おは|おっは|出勤|始め|はじめ|ハロー|はろー|hello|morning)/],
      ['leave', /(おつ|乙|お疲|お先|帰|退勤|さようなら|終わり|おわり|bye|グッバイ)/],
      ['add_timesheet', /[0-9]+月はこれ/]
    ];

    var command = _.find(commands, function (cmd) {
      return (cmd && message.match(cmd[1]));
    });

    if (command && this[command[0]]) {
      return this[command[0]](username);
    }
  };

  Runner.prototype.attendance = function (username, message) {
    if (this.date == undefined || this.time == undefined) return;

    var spreadsheet_id = this.settings.get('TimeSheets', this.date[0]+'月');
    if (! spreadsheet_id) return;

    this.timesheets.initSpreadsheet(spreadsheet_id);
    this.timesheets.set(username, 'C', this.date, this.time);
    this.timesheets.set(username, 'E', this.date, '1:00');

    var message = this.templates.format('attendance', username, this.date, this.time);
    this.slack.send(message);
  };

  Runner.prototype.leave = function (username, message) {
    if (this.date == undefined || this.time == undefined) return;

    var spreadsheet_id = this.settings.get('TimeSheets', this.date[0]+'月');
    if (! spreadsheet_id) return;

    this.timesheets.initSpreadsheet(spreadsheet_id);
    this.timesheets.set(username, 'D', this.date, this.time);

    var message = this.templates.format('leave', username, this.date, this.time);
    this.slack.send(message);
  };

  Runner.prototype.add_timesheet = function (username, message) {
    var matches = message.match(/[0-9]+月/);
    if (! matches) return;
    console.log(matches);
  };

  return Runner;
};

if (typeof exports !== 'undefined') {
  exports.Runner = loadRunner();
}
