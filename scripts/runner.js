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
      ['attendance', /(おは|おっは|出勤|始め|はじめ|ハロー|はろー|hello|morning|出社|モーニン|:sunny:)/],
      ['leave', /(おつ|乙|お疲|お先|帰|退勤|さようなら|終わり|終わる|おわり|おわる|bye|失礼します|グッバイ|退社|:frog:|:beer:|:beers:)/],
      ['breaktime', /(昼食|ランチ|休憩|:bento:)/],
      ['add_timesheet', /[0-9]+月はこれ/],
      ['get_timesheet', /[0-9]+月の日報/]
    ];

    var command = _.find(commands, function (cmd) {
      return (cmd && message.match(cmd[1]));
    });

    if (command && this[command[0]]) {
      return this[command[0]](username, message);
    }
  };

  Runner.prototype.attendance = function (username, message) {
    if (! this.date) this.date = DateUtils.today();
    if (! this.time) this.time = DateUtils.nowtime();
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
    if (! this.date) this.date = DateUtils.today();
    if (! this.time) this.time = DateUtils.nowtime();
    if (this.date == undefined || this.time == undefined) return;

    var spreadsheet_id = this.settings.get('TimeSheets', this.date[0]+'月');
    if (! spreadsheet_id) return;

    this.timesheets.initSpreadsheet(spreadsheet_id);
    this.timesheets.set(username, 'D', this.date, this.time);

    var message = this.templates.format('leave', username, this.date, this.time);
    this.slack.send(message);
  };

  Runner.prototype.breaktime = function (username, message) {
    if (! this.date) this.date = DateUtils.today();
    if (! this.time) this.time = '1:00';
    if (this.date == undefined || this.time == undefined) return;

    var spreadsheet_id = this.settings.get('TimeSheets', this.date[0]+'月');
    if (! spreadsheet_id) return;

    this.timesheets.initSpreadsheet(spreadsheet_id);
    this.timesheets.set(username, 'E', this.date, this.time);

    var message = this.templates.format('breaktime', username, this.date, this.time);
    this.slack.send(message);
  };

  Runner.prototype.add_timesheet = function (username, message) {
    if (username !== 'app2641') return;
    var month_matches = message.match(/[0-9]+月/);
    var id_matches = message.match(/https:\/\/docs\.google\.com\/spreadsheets\/d\/([^\/]*)/);
    if (month_matches === null || id_matches === null) return;

    var month = month_matches[0];
    var ss_id = id_matches[1];
    this.settings.set('TimeSheets', month, ss_id);

    var message = '@'+username+' '+month+'の業務日報を登録';
    this.slack.send(message);
  };

  Runner.prototype.get_timesheet = function (username, message) {
    var month_matches = message.match(/[0-9]+月/);
    if (! month_matches) return;

    var month = month_matches[0];
    var ss_id = this.settings.get('TimeSheets', month);

    var message = '@'+username+' https://docs.google.com/spreadsheets/d/'+ss_id+'/edit';
    this.slack.send(message);
  };

  return Runner;
};

if (typeof exports !== 'undefined') {
  exports.Runner = loadRunner();
}
