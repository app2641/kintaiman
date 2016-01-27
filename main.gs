/* KintaiMan https://github.com/app2641/kintaiman */
/* Version 0.2.1 */
/* (c) app2641 2016- License: MIT */
/* ------------------- */
/**
 * DateUtils
 * Copyright (c) 2016 app2641
 */

loadDateUtils = function () {
  var DateUtils = {};

  var date = new Date();
  var now = function (datetime) {
    if (typeof datetime !== 'undefined') {
      date = datetime;
    }

    return date;
  };
  DateUtils.now = now;

  DateUtils.parseTime = function (str) {
    str = String(str || "").toLowerCase().replace(/[Ａ-Ｚａ-ｚ０-９：]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });

    var reg = /((\d{1,2})\s*[:時]{1}\s*(\d{1,2})\s*(pm|)|(am|pm|午前|午後)\s*(\d{1,2})(\s*[:時]\s*(\d{1,2})|)|(\d{1,2})(\s*[:時]{1}\s*(\d{1,2})|)(am|pm)|(\d{1,2})\s*時)/;
    var matches = str.match(reg);
    if (matches) {
      var hour, min;

      // 1時20, 2:30, 3:00pm
      if (matches[2] != null) {
        hour = parseInt(matches[2]);
        min = matches[3] ? matches[3] : '00';
        if (_.contains(['pm'], matches[4])) {
          hour += 12;
        }
      }

      // 午後1 午後2時30 pm3
      if (matches[5] != null) {
        hour = parseInt(matches[6]);
        min = matches[8] ? matches[8] : '00';
        if (_.contains(['pm', '午後'], matches[5])) {
          hour += 12;
        }
      }

      // 1am 2:30pm
      if (matches[9] != null) {
        hour = parseInt(matches[9]);
        min = matches[11] ? matches[11] : '00';
        if (_.contains(['pm'], matches[12])) {
          hour += 12;
        }
      }

      // 14時
      if (matches[13] != null) {
        hour = parseInt(matches[13]);
        min = '00';
      }

      min = (String(min).length == 1) ? '0' + min : min;
      return hour + ':' + min;
    }
  };

  DateUtils.parseDate = function (str) {
    str = String(str || "").toLowerCase().replace(/[Ａ-Ｚａ-ｚ０-９／]/g, function (s) {
      return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    });

    if (str.match(/(明日|tomorrow)/)) {
      var tomorrow = new Date(now().getFullYear(), now().getMonth(), now().getDate()+1);
      return [tomorrow.getMonth()+1, tomorrow.getDate()]
    }

    if (str.match(/(今日|today)/)) {
      return [now().getMonth()+1, now().getDate()]
    }

    if (str.match(/(昨日|yesterday)/)) {
      var yesterday = new Date(now().getFullYear(), now().getMonth(), now().getDate()-1);
      return [yesterday.getMonth()+1, yesterday.getDate()]
    }

    var reg = /((\d{4})[-\/年]{1}|)(\d{1,2})[-\/月]{1}(\d{1,2})/;
    var matches = str.match(reg);
    if (matches) {
      var month = parseInt(matches[3]);
      var day = parseInt(matches[4]);

      return [month, day];
    }
  };

  DateUtils.today = function (message) {
    var month = now().getMonth() + 1;
    var day = now().getDate();

    return [month, day];
  };

  DateUtils.nowtime = function (message) {
    var hour = now().getHours();
    var min = now().getMinutes();
    min = (String(min).length == 1) ? '0' + min : min;

    return hour + ':' + min;
  };

  return DateUtils;
};

if (typeof exports !== 'undefined') {
  exports.DateUtils = loadDateUtils();
}
/**
 * EventListener
 * Copyright (c) 2016 app2641
 */

loadEventListener = function () {
  var EventListener = function () {
    this.events = {};
  };

  EventListener.prototype.on = function (event_name, func) {
    if (this.events[event_name]) {
      this.events[event_name].push(func);
    } else {
      this.events[event_name] = [func];
    }
  };

  EventListener.prototype.fireEvent = function (event_name) {
    var funcs = this.events[event_name];
    if (funcs) {
      for (var i = 0; i < funcs.length; ++i) {
        funcs[i].apply(this, Array.prototype.slice.call(arguments, 1));
      }
    }
  };

  return EventListener;
};

if (typeof exports !== 'undefined') {
  exports.EventListener = loadEventListener();
}
/**
* GlobalSettings
* Copyright (c) 2016 app2641
*/

loadGlobalSettings = function (exports) {
  var GlobalSettings = function () {
    this.properties = PropertiesService.getScriptProperties();
  };

  GlobalSettings.prototype.get = function (key) {
    return this.properties.getProperty(key);
  };

  GlobalSettings.prototype.set = function (key, val) {
    this.properties.setProperty(key, val);
    return val;
  };

  GlobalSettings.prototype.destroy = function (key) {
    return this.properties.deleteProperty(key);
  }

  return GlobalSettings;
};

if (typeof exports !== 'undefined') {
  exports.GlobalSettings = loadGlobalSettings();
}

var initLibraries = function () {
  if (typeof GlobalSettings === 'undefined') GlobalSettings = loadGlobalSettings();
  if (typeof Runner === 'undefined') Runner = loadRunner();
  if (typeof Settings === 'undefined') Settings = loadSettings();
  if (typeof Slack === 'undefined') Slack = loadSlack();
  if (typeof Templates === 'undefined') Templates = loadTemplates();
  if (typeof Timesheets === 'undefined') Timesheets = loadTimesheets();
  if(typeof DateUtils === 'undefined') DateUtils = loadDateUtils();
};

var init = function () {
  initLibraries();

  var global_settings = new GlobalSettings();
  var ss_id = global_settings.get('spreadsheet_id');
  if (ss_id) {
    var ss = SpreadsheetApp.openById(ss_id);
    var settings = new Settings(ss);
    var templates = new Templates();
    var slack = new Slack(settings.get('Settings', 'SlackUrl'), templates, settings);
    var timesheets = new Timesheets(settings);
    var runner = new Runner(settings, timesheets, templates, slack);

    return {
      receiver: slack,
      runner: runner,
      timesheets: timesheets
    };
  }

  return null;
}

function doPost (e) {
  var bot = init();
  bot.receiver.receiveMessage(e.parameters);
}

function setUp () {
  initLibraries();

  var global_settings = new GlobalSettings();
  if (!global_settings.get('spreadsheet_id')) {
    var ss = SpreadsheetApp.create('TimeSetting');
    ss.getSheets()[0].setName('Settings');
    ss.insertSheet('TimeSheets');
    ss.insertSheet('Users');
    global_settings.set('spreadsheet_id', ss.getId());

    var settings = new Settings(ss);
    settings.set('Settings', 'SlackUrl', '');
    Logger.log(settings.get('Settings', 'SlackUrl'));
  }
};

function test () {
  var bot = init();
  var global_settings = new GlobalSettings();

  if (global_settings.get('spreadsheet_id')) {
    // global_settings.destroy('spreadsheet_id');
  }
  bot.receiver.receiveMessage({user_name:"app2641", text:"おは 12/1 8:00"});
}
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
      ['attendance', /(おは|おっは|出勤|始め|はじめ|ハロー|はろー|hello|morning|出社|モーニン|:sunny:)/i],
      ['leave', /(おつ|乙|お疲|お先|帰|退勤|さようなら|終わり|終わる|おわり|おわる|bye|失礼します|グッバイ|退社|:frog:|:beer:|:beers:)/i],
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
/**
* Settings
* Copyright (c) 2016 app2641
*/

loadSettings = function (exports) {
  var Settings = function (spreadsheet) {
    this.setting_sheet;
    this.time_sheet;
    this.user_sheet;

    this.getSheet = function (sheet_name) {
      switch (sheet_name) {
        case 'Settings':
          if (typeof this.setting_sheet === 'undefined') {
            this.setting_sheet = spreadsheet.getSheetByName('Settings');
          }
          return this.setting_sheet;
          break;
        case 'TimeSheets':
          if (typeof this.time_sheet === 'undefined') {
            this.time_sheet = spreadsheet.getSheetByName('TimeSheets');
          }
          return this.time_sheet;
          break;
        case 'Users':
          if (typeof this.user_sheet === 'undefined') {
            this.user_sheet = spreadsheet.getSheetByName('Users');
          }
          return this.user_sheet;
          break;
      };
    };
  };

  Settings.prototype.get = function (sheet_name, key) {
    var sheet = this.getSheet(sheet_name);
    var vals = _.find(sheet.getRange("A1:B"+sheet.getLastRow()).getValues(), function(v) {
      return(v[0] == key);
    });

    if (vals) {
      return String(vals[1]);
    } else {
      return null;
    }
  };

  Settings.prototype.set = function (sheet_name, key, val) {
    var sheet = this.getSheet(sheet_name);
    var last_row = sheet.getLastRow();

    if (last_row > 0) {
      var vals = sheet.getRange("A1:A"+last_row).getValues();

      var low;
      for (var i = 0; i < last_row; ++i) {
        if (vals[i][0] == key) {
          low = (i + 1);
          break;
        }
      }

      if (low) {
        sheet.getRange('B'+low).setValue(String(val));
      } else {
        sheet.getRange('A'+low+':B'+low).setValues([String(key), String(val)]);
      }

      return val;
    }

    sheet.getRange("A"+(last_row + 1)+":B"+(last_row + 1)).setValues([[key, val]]);
    return val;
  };

  return Settings;
};

if (typeof exports !== 'undefined') {
  exports.Settings = loadSettings();
}
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
/**
 * Templates
 * Copyright (c) 2016 app2641
 */

loadTemplates = function () {
  Templates = function () {
    this.getBaseMessage = function (action) {
      var message = '@{0} {1}/{2} {3} ';

      switch (action) {
        case 'attendance':
          message += '出勤';
          break;

        case 'leave':
          message += '退勤';
          break;

        case 'breaktime':
          message += '休憩';
          break;
      }

      return message;
    };
  };

  Templates.prototype.format = function (action, username, date, time) {
    var message = this.getBaseMessage(action);
    var args = [username, date[0], date[1], time];

    for (var i = 0; i < args.length; i++) {
      message = message.replace('{'+i+'}', args[i]);
    }

    return message;
  };

  return Templates;
};

if (typeof exports !== 'undefined') {
  exports.Templates = loadTemplates();
}
/**
 * Timesheets
 * Copyright (c) 2016 app2641
 */

loadTimesheets = function () {
  var Timesheets = function (settings) {
    this.settings = settings;
  };

  Timesheets.prototype.initSpreadsheet = function (spreadsheet_id) {
    this.ss = SpreadsheetApp.openById(spreadsheet_id);

    this.setValue = function (sheet, column, key, value) {
      var index = 9;
      var last_row = String(sheet.getLastRow());
      var values = sheet.getRange('A'+index+':A' + last_row).getValues();

      for (var i = 0; i < last_row; ++i) {
        if (values[i][0] == key) {
          sheet.getRange(column + (index + i)).setValue(String(value));
          return value;
        }
      }
    };
  };

  Timesheets.prototype.set = function (username, column, date, time) {
    if (! this.ss) return;

    var official_name = this.settings.get('Users', username);
    var sheet = this.ss.getSheetByName(official_name);
    if (! sheet) {
      this.ss.getSheetByName('見本').copyTo(this.ss);
      sheet = this.ss.getSheetByName('Copy of 見本');
      sheet.setName(official_name);
    }

    this.setValue(sheet, column, date[1], time);
  };

  return Timesheets;
};

if (typeof exports !== 'undefined') {
  exports.Timesheets = loadTimesheets();
}
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function(){function n(n){function t(t,r,e,u,i,o){for(;i>=0&&o>i;i+=n){var a=u?u[i]:i;e=r(e,t[a],a,t)}return e}return function(r,e,u,i){e=b(e,i,4);var o=!k(r)&&m.keys(r),a=(o||r).length,c=n>0?0:a-1;return arguments.length<3&&(u=r[o?o[c]:c],c+=n),t(r,e,u,o,c,a)}}function t(n){return function(t,r,e){r=x(r,e);for(var u=O(t),i=n>0?0:u-1;i>=0&&u>i;i+=n)if(r(t[i],i,t))return i;return-1}}function r(n,t,r){return function(e,u,i){var o=0,a=O(e);if("number"==typeof i)n>0?o=i>=0?i:Math.max(i+a,o):a=i>=0?Math.min(i+1,a):i+a+1;else if(r&&i&&a)return i=r(e,u),e[i]===u?i:-1;if(u!==u)return i=t(l.call(e,o,a),m.isNaN),i>=0?i+o:-1;for(i=n>0?o:a-1;i>=0&&a>i;i+=n)if(e[i]===u)return i;return-1}}function e(n,t){var r=I.length,e=n.constructor,u=m.isFunction(e)&&e.prototype||a,i="constructor";for(m.has(n,i)&&!m.contains(t,i)&&t.push(i);r--;)i=I[r],i in n&&n[i]!==u[i]&&!m.contains(t,i)&&t.push(i)}var u=this,i=u._,o=Array.prototype,a=Object.prototype,c=Function.prototype,f=o.push,l=o.slice,s=a.toString,p=a.hasOwnProperty,h=Array.isArray,v=Object.keys,g=c.bind,y=Object.create,d=function(){},m=function(n){return n instanceof m?n:this instanceof m?void(this._wrapped=n):new m(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=m),exports._=m):u._=m,m.VERSION="1.8.3";var b=function(n,t,r){if(t===void 0)return n;switch(null==r?3:r){case 1:return function(r){return n.call(t,r)};case 2:return function(r,e){return n.call(t,r,e)};case 3:return function(r,e,u){return n.call(t,r,e,u)};case 4:return function(r,e,u,i){return n.call(t,r,e,u,i)}}return function(){return n.apply(t,arguments)}},x=function(n,t,r){return null==n?m.identity:m.isFunction(n)?b(n,t,r):m.isObject(n)?m.matcher(n):m.property(n)};m.iteratee=function(n,t){return x(n,t,1/0)};var _=function(n,t){return function(r){var e=arguments.length;if(2>e||null==r)return r;for(var u=1;e>u;u++)for(var i=arguments[u],o=n(i),a=o.length,c=0;a>c;c++){var f=o[c];t&&r[f]!==void 0||(r[f]=i[f])}return r}},j=function(n){if(!m.isObject(n))return{};if(y)return y(n);d.prototype=n;var t=new d;return d.prototype=null,t},w=function(n){return function(t){return null==t?void 0:t[n]}},A=Math.pow(2,53)-1,O=w("length"),k=function(n){var t=O(n);return"number"==typeof t&&t>=0&&A>=t};m.each=m.forEach=function(n,t,r){t=b(t,r);var e,u;if(k(n))for(e=0,u=n.length;u>e;e++)t(n[e],e,n);else{var i=m.keys(n);for(e=0,u=i.length;u>e;e++)t(n[i[e]],i[e],n)}return n},m.map=m.collect=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=Array(u),o=0;u>o;o++){var a=e?e[o]:o;i[o]=t(n[a],a,n)}return i},m.reduce=m.foldl=m.inject=n(1),m.reduceRight=m.foldr=n(-1),m.find=m.detect=function(n,t,r){var e;return e=k(n)?m.findIndex(n,t,r):m.findKey(n,t,r),e!==void 0&&e!==-1?n[e]:void 0},m.filter=m.select=function(n,t,r){var e=[];return t=x(t,r),m.each(n,function(n,r,u){t(n,r,u)&&e.push(n)}),e},m.reject=function(n,t,r){return m.filter(n,m.negate(x(t)),r)},m.every=m.all=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=0;u>i;i++){var o=e?e[i]:i;if(!t(n[o],o,n))return!1}return!0},m.some=m.any=function(n,t,r){t=x(t,r);for(var e=!k(n)&&m.keys(n),u=(e||n).length,i=0;u>i;i++){var o=e?e[i]:i;if(t(n[o],o,n))return!0}return!1},m.contains=m.includes=m.include=function(n,t,r,e){return k(n)||(n=m.values(n)),("number"!=typeof r||e)&&(r=0),m.indexOf(n,t,r)>=0},m.invoke=function(n,t){var r=l.call(arguments,2),e=m.isFunction(t);return m.map(n,function(n){var u=e?t:n[t];return null==u?u:u.apply(n,r)})},m.pluck=function(n,t){return m.map(n,m.property(t))},m.where=function(n,t){return m.filter(n,m.matcher(t))},m.findWhere=function(n,t){return m.find(n,m.matcher(t))},m.max=function(n,t,r){var e,u,i=-1/0,o=-1/0;if(null==t&&null!=n){n=k(n)?n:m.values(n);for(var a=0,c=n.length;c>a;a++)e=n[a],e>i&&(i=e)}else t=x(t,r),m.each(n,function(n,r,e){u=t(n,r,e),(u>o||u===-1/0&&i===-1/0)&&(i=n,o=u)});return i},m.min=function(n,t,r){var e,u,i=1/0,o=1/0;if(null==t&&null!=n){n=k(n)?n:m.values(n);for(var a=0,c=n.length;c>a;a++)e=n[a],i>e&&(i=e)}else t=x(t,r),m.each(n,function(n,r,e){u=t(n,r,e),(o>u||1/0===u&&1/0===i)&&(i=n,o=u)});return i},m.shuffle=function(n){for(var t,r=k(n)?n:m.values(n),e=r.length,u=Array(e),i=0;e>i;i++)t=m.random(0,i),t!==i&&(u[i]=u[t]),u[t]=r[i];return u},m.sample=function(n,t,r){return null==t||r?(k(n)||(n=m.values(n)),n[m.random(n.length-1)]):m.shuffle(n).slice(0,Math.max(0,t))},m.sortBy=function(n,t,r){return t=x(t,r),m.pluck(m.map(n,function(n,r,e){return{value:n,index:r,criteria:t(n,r,e)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var F=function(n){return function(t,r,e){var u={};return r=x(r,e),m.each(t,function(e,i){var o=r(e,i,t);n(u,e,o)}),u}};m.groupBy=F(function(n,t,r){m.has(n,r)?n[r].push(t):n[r]=[t]}),m.indexBy=F(function(n,t,r){n[r]=t}),m.countBy=F(function(n,t,r){m.has(n,r)?n[r]++:n[r]=1}),m.toArray=function(n){return n?m.isArray(n)?l.call(n):k(n)?m.map(n,m.identity):m.values(n):[]},m.size=function(n){return null==n?0:k(n)?n.length:m.keys(n).length},m.partition=function(n,t,r){t=x(t,r);var e=[],u=[];return m.each(n,function(n,r,i){(t(n,r,i)?e:u).push(n)}),[e,u]},m.first=m.head=m.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:m.initial(n,n.length-t)},m.initial=function(n,t,r){return l.call(n,0,Math.max(0,n.length-(null==t||r?1:t)))},m.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:m.rest(n,Math.max(0,n.length-t))},m.rest=m.tail=m.drop=function(n,t,r){return l.call(n,null==t||r?1:t)},m.compact=function(n){return m.filter(n,m.identity)};var S=function(n,t,r,e){for(var u=[],i=0,o=e||0,a=O(n);a>o;o++){var c=n[o];if(k(c)&&(m.isArray(c)||m.isArguments(c))){t||(c=S(c,t,r));var f=0,l=c.length;for(u.length+=l;l>f;)u[i++]=c[f++]}else r||(u[i++]=c)}return u};m.flatten=function(n,t){return S(n,t,!1)},m.without=function(n){return m.difference(n,l.call(arguments,1))},m.uniq=m.unique=function(n,t,r,e){m.isBoolean(t)||(e=r,r=t,t=!1),null!=r&&(r=x(r,e));for(var u=[],i=[],o=0,a=O(n);a>o;o++){var c=n[o],f=r?r(c,o,n):c;t?(o&&i===f||u.push(c),i=f):r?m.contains(i,f)||(i.push(f),u.push(c)):m.contains(u,c)||u.push(c)}return u},m.union=function(){return m.uniq(S(arguments,!0,!0))},m.intersection=function(n){for(var t=[],r=arguments.length,e=0,u=O(n);u>e;e++){var i=n[e];if(!m.contains(t,i)){for(var o=1;r>o&&m.contains(arguments[o],i);o++);o===r&&t.push(i)}}return t},m.difference=function(n){var t=S(arguments,!0,!0,1);return m.filter(n,function(n){return!m.contains(t,n)})},m.zip=function(){return m.unzip(arguments)},m.unzip=function(n){for(var t=n&&m.max(n,O).length||0,r=Array(t),e=0;t>e;e++)r[e]=m.pluck(n,e);return r},m.object=function(n,t){for(var r={},e=0,u=O(n);u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},m.findIndex=t(1),m.findLastIndex=t(-1),m.sortedIndex=function(n,t,r,e){r=x(r,e,1);for(var u=r(t),i=0,o=O(n);o>i;){var a=Math.floor((i+o)/2);r(n[a])<u?i=a+1:o=a}return i},m.indexOf=r(1,m.findIndex,m.sortedIndex),m.lastIndexOf=r(-1,m.findLastIndex),m.range=function(n,t,r){null==t&&(t=n||0,n=0),r=r||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=Array(e),i=0;e>i;i++,n+=r)u[i]=n;return u};var E=function(n,t,r,e,u){if(!(e instanceof t))return n.apply(r,u);var i=j(n.prototype),o=n.apply(i,u);return m.isObject(o)?o:i};m.bind=function(n,t){if(g&&n.bind===g)return g.apply(n,l.call(arguments,1));if(!m.isFunction(n))throw new TypeError("Bind must be called on a function");var r=l.call(arguments,2),e=function(){return E(n,e,t,this,r.concat(l.call(arguments)))};return e},m.partial=function(n){var t=l.call(arguments,1),r=function(){for(var e=0,u=t.length,i=Array(u),o=0;u>o;o++)i[o]=t[o]===m?arguments[e++]:t[o];for(;e<arguments.length;)i.push(arguments[e++]);return E(n,r,this,this,i)};return r},m.bindAll=function(n){var t,r,e=arguments.length;if(1>=e)throw new Error("bindAll must be passed function names");for(t=1;e>t;t++)r=arguments[t],n[r]=m.bind(n[r],n);return n},m.memoize=function(n,t){var r=function(e){var u=r.cache,i=""+(t?t.apply(this,arguments):e);return m.has(u,i)||(u[i]=n.apply(this,arguments)),u[i]};return r.cache={},r},m.delay=function(n,t){var r=l.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},m.defer=m.partial(m.delay,m,1),m.throttle=function(n,t,r){var e,u,i,o=null,a=0;r||(r={});var c=function(){a=r.leading===!1?0:m.now(),o=null,i=n.apply(e,u),o||(e=u=null)};return function(){var f=m.now();a||r.leading!==!1||(a=f);var l=t-(f-a);return e=this,u=arguments,0>=l||l>t?(o&&(clearTimeout(o),o=null),a=f,i=n.apply(e,u),o||(e=u=null)):o||r.trailing===!1||(o=setTimeout(c,l)),i}},m.debounce=function(n,t,r){var e,u,i,o,a,c=function(){var f=m.now()-o;t>f&&f>=0?e=setTimeout(c,t-f):(e=null,r||(a=n.apply(i,u),e||(i=u=null)))};return function(){i=this,u=arguments,o=m.now();var f=r&&!e;return e||(e=setTimeout(c,t)),f&&(a=n.apply(i,u),i=u=null),a}},m.wrap=function(n,t){return m.partial(t,n)},m.negate=function(n){return function(){return!n.apply(this,arguments)}},m.compose=function(){var n=arguments,t=n.length-1;return function(){for(var r=t,e=n[t].apply(this,arguments);r--;)e=n[r].call(this,e);return e}},m.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},m.before=function(n,t){var r;return function(){return--n>0&&(r=t.apply(this,arguments)),1>=n&&(t=null),r}},m.once=m.partial(m.before,2);var M=!{toString:null}.propertyIsEnumerable("toString"),I=["valueOf","isPrototypeOf","toString","propertyIsEnumerable","hasOwnProperty","toLocaleString"];m.keys=function(n){if(!m.isObject(n))return[];if(v)return v(n);var t=[];for(var r in n)m.has(n,r)&&t.push(r);return M&&e(n,t),t},m.allKeys=function(n){if(!m.isObject(n))return[];var t=[];for(var r in n)t.push(r);return M&&e(n,t),t},m.values=function(n){for(var t=m.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},m.mapObject=function(n,t,r){t=x(t,r);for(var e,u=m.keys(n),i=u.length,o={},a=0;i>a;a++)e=u[a],o[e]=t(n[e],e,n);return o},m.pairs=function(n){for(var t=m.keys(n),r=t.length,e=Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},m.invert=function(n){for(var t={},r=m.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},m.functions=m.methods=function(n){var t=[];for(var r in n)m.isFunction(n[r])&&t.push(r);return t.sort()},m.extend=_(m.allKeys),m.extendOwn=m.assign=_(m.keys),m.findKey=function(n,t,r){t=x(t,r);for(var e,u=m.keys(n),i=0,o=u.length;o>i;i++)if(e=u[i],t(n[e],e,n))return e},m.pick=function(n,t,r){var e,u,i={},o=n;if(null==o)return i;m.isFunction(t)?(u=m.allKeys(o),e=b(t,r)):(u=S(arguments,!1,!1,1),e=function(n,t,r){return t in r},o=Object(o));for(var a=0,c=u.length;c>a;a++){var f=u[a],l=o[f];e(l,f,o)&&(i[f]=l)}return i},m.omit=function(n,t,r){if(m.isFunction(t))t=m.negate(t);else{var e=m.map(S(arguments,!1,!1,1),String);t=function(n,t){return!m.contains(e,t)}}return m.pick(n,t,r)},m.defaults=_(m.allKeys,!0),m.create=function(n,t){var r=j(n);return t&&m.extendOwn(r,t),r},m.clone=function(n){return m.isObject(n)?m.isArray(n)?n.slice():m.extend({},n):n},m.tap=function(n,t){return t(n),n},m.isMatch=function(n,t){var r=m.keys(t),e=r.length;if(null==n)return!e;for(var u=Object(n),i=0;e>i;i++){var o=r[i];if(t[o]!==u[o]||!(o in u))return!1}return!0};var N=function(n,t,r,e){if(n===t)return 0!==n||1/n===1/t;if(null==n||null==t)return n===t;n instanceof m&&(n=n._wrapped),t instanceof m&&(t=t._wrapped);var u=s.call(n);if(u!==s.call(t))return!1;switch(u){case"[object RegExp]":case"[object String]":return""+n==""+t;case"[object Number]":return+n!==+n?+t!==+t:0===+n?1/+n===1/t:+n===+t;case"[object Date]":case"[object Boolean]":return+n===+t}var i="[object Array]"===u;if(!i){if("object"!=typeof n||"object"!=typeof t)return!1;var o=n.constructor,a=t.constructor;if(o!==a&&!(m.isFunction(o)&&o instanceof o&&m.isFunction(a)&&a instanceof a)&&"constructor"in n&&"constructor"in t)return!1}r=r||[],e=e||[];for(var c=r.length;c--;)if(r[c]===n)return e[c]===t;if(r.push(n),e.push(t),i){if(c=n.length,c!==t.length)return!1;for(;c--;)if(!N(n[c],t[c],r,e))return!1}else{var f,l=m.keys(n);if(c=l.length,m.keys(t).length!==c)return!1;for(;c--;)if(f=l[c],!m.has(t,f)||!N(n[f],t[f],r,e))return!1}return r.pop(),e.pop(),!0};m.isEqual=function(n,t){return N(n,t)},m.isEmpty=function(n){return null==n?!0:k(n)&&(m.isArray(n)||m.isString(n)||m.isArguments(n))?0===n.length:0===m.keys(n).length},m.isElement=function(n){return!(!n||1!==n.nodeType)},m.isArray=h||function(n){return"[object Array]"===s.call(n)},m.isObject=function(n){var t=typeof n;return"function"===t||"object"===t&&!!n},m.each(["Arguments","Function","String","Number","Date","RegExp","Error"],function(n){m["is"+n]=function(t){return s.call(t)==="[object "+n+"]"}}),m.isArguments(arguments)||(m.isArguments=function(n){return m.has(n,"callee")}),"function"!=typeof/./&&"object"!=typeof Int8Array&&(m.isFunction=function(n){return"function"==typeof n||!1}),m.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},m.isNaN=function(n){return m.isNumber(n)&&n!==+n},m.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"===s.call(n)},m.isNull=function(n){return null===n},m.isUndefined=function(n){return n===void 0},m.has=function(n,t){return null!=n&&p.call(n,t)},m.noConflict=function(){return u._=i,this},m.identity=function(n){return n},m.constant=function(n){return function(){return n}},m.noop=function(){},m.property=w,m.propertyOf=function(n){return null==n?function(){}:function(t){return n[t]}},m.matcher=m.matches=function(n){return n=m.extendOwn({},n),function(t){return m.isMatch(t,n)}},m.times=function(n,t,r){var e=Array(Math.max(0,n));t=b(t,r,1);for(var u=0;n>u;u++)e[u]=t(u);return e},m.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))},m.now=Date.now||function(){return(new Date).getTime()};var B={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;","`":"&#x60;"},T=m.invert(B),R=function(n){var t=function(t){return n[t]},r="(?:"+m.keys(n).join("|")+")",e=RegExp(r),u=RegExp(r,"g");return function(n){return n=null==n?"":""+n,e.test(n)?n.replace(u,t):n}};m.escape=R(B),m.unescape=R(T),m.result=function(n,t,r){var e=null==n?void 0:n[t];return e===void 0&&(e=r),m.isFunction(e)?e.call(n):e};var q=0;m.uniqueId=function(n){var t=++q+"";return n?n+t:t},m.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var K=/(.)^/,z={"'":"'","\\":"\\","\r":"r","\n":"n","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\u2028|\u2029/g,L=function(n){return"\\"+z[n]};m.template=function(n,t,r){!t&&r&&(t=r),t=m.defaults({},t,m.templateSettings);var e=RegExp([(t.escape||K).source,(t.interpolate||K).source,(t.evaluate||K).source].join("|")+"|$","g"),u=0,i="__p+='";n.replace(e,function(t,r,e,o,a){return i+=n.slice(u,a).replace(D,L),u=a+t.length,r?i+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'":e?i+="'+\n((__t=("+e+"))==null?'':__t)+\n'":o&&(i+="';\n"+o+"\n__p+='"),t}),i+="';\n",t.variable||(i="with(obj||{}){\n"+i+"}\n"),i="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+i+"return __p;\n";try{var o=new Function(t.variable||"obj","_",i)}catch(a){throw a.source=i,a}var c=function(n){return o.call(this,n,m)},f=t.variable||"obj";return c.source="function("+f+"){\n"+i+"}",c},m.chain=function(n){var t=m(n);return t._chain=!0,t};var P=function(n,t){return n._chain?m(t).chain():t};m.mixin=function(n){m.each(m.functions(n),function(t){var r=m[t]=n[t];m.prototype[t]=function(){var n=[this._wrapped];return f.apply(n,arguments),P(this,r.apply(m,n))}})},m.mixin(m),m.each(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=o[n];m.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!==n&&"splice"!==n||0!==r.length||delete r[0],P(this,r)}}),m.each(["concat","join","slice"],function(n){var t=o[n];m.prototype[n]=function(){return P(this,t.apply(this._wrapped,arguments))}}),m.prototype.value=function(){return this._wrapped},m.prototype.valueOf=m.prototype.toJSON=m.prototype.value,m.prototype.toString=function(){return""+this._wrapped},"function"==typeof define&&define.amd&&define("underscore",[],function(){return m})}).call(this);
//# sourceMappingURL=underscore-min.map