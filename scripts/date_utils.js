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
