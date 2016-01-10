QUnit.test('Settings', function (assert) {
  var range = {
    values: [['key1', '']],

    getValues: function () {
      return this.values;
    },

    setValue: function (value) {
      var key = 'key1';
      var val = _.find(this.values, function(v) {
        return (v[0] == key);
      });

      if (val) {
        val[1] = value;
      } else{
        this.values.push([key, value]);
      }
      return val;
    }, 

    setValues: function (values) {
      var len = this.values.length;
      for (var i = 0; i < len; i++) {
        var key_i = this.values.length + i + 1;
        this.values.push(['key' + key_i, values[1]]);
      }
    }
  };

  var sheet = {
    getLastRow: function () {
      return this.getRange().getValues().length;
    },

    getRange: function () {
      return range;
    }
  };

  var ss = {
    getSheetByName: function () {
      return sheet;
    }
  };

  var sheet_name = 'Settings';
  var settings = new Settings(ss);

  assert.ok(_.isEqual(settings.set(sheet_name, 'key1', 'val1'), 'val1'));
  assert.ok(_.isEqual(settings.get(sheet_name, 'key1'), 'val1'));
  assert.ok(_.isEqual(settings.set(sheet_name, 'key2', 'val2'), 'val2'));
  assert.ok(_.isEqual(settings.get(sheet_name, 'key2'), 'val2'));
});
