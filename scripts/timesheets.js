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
