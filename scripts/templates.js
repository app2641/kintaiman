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
