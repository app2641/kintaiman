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
