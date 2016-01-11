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
