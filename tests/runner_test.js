QUnit.test('Runner', function (assert) {
  var settings = {
    get: function () {
      return 'spreadsheet_id';
    },

    set: function () {}
  };

  var templates = {
    format: function (action, username, date, time) {
      var note;
      switch (action) {
        case 'attendance':
          note = '出勤';
          break;
        case 'leave':
          note = '退勤';
          break;
        case 'breaktime':
          note = '休憩';
          break;
      }
      return '@'+username+' '+date[0]+'/'+date[1]+' '+time+' '+note;
    }
  };

  var timesheets = {
    initSpreadsheet: function () {},
    set: function () {}
  };

  var slack = {
    message: [],

    send: function (message) {
      this.message.push(message);
    },

    on: function () {},

    clearMessages: function () {
      this.message = [];
    }
  };

  var runner = new Runner(settings, timesheets, templates, slack);
  DateUtils.now(new Date(2015, 0, 2, 12, 34, 0));

  var msgTest = function (username, msg, expect_msg) {
    slack.clearMessages();
    runner.receiveMessage(username, msg);
    assert.ok(_.isEqual(expect_msg, slack.message));
  };

  msgTest('user1', 'おはよう', ['@user1 1/2 12:34 出勤']);
  msgTest('user1', 'おはー 13時', ['@user1 1/2 13:00 出勤']);
  msgTest('user1', 'hello 2/3 10:20', ['@user1 2/3 10:20 出勤']);
  msgTest('user1', 'Hello', ['@user1 1/2 12:34 出勤']);
  msgTest('user1', '始めます 10/2 午後2時', ['@user1 10/2 14:00 出勤']);
  msgTest('user1', ':sunny:', ['@user1 1/2 12:34 出勤']);

  msgTest('user1', 'お疲れ様でした', ['@user1 1/2 12:34 退勤']);
  msgTest('user1', 'Bye', ['@user1 1/2 12:34 退勤']);
  msgTest('user1', 'おつ 8:21', ['@user1 1/2 8:21 退勤']);
  msgTest('user1', 'おわり 6/14 pm3:00', ['@user1 6/14 15:00 退勤']);
  msgTest('user1', '帰ります 午後8時', ['@user1 1/2 20:00 退勤']);
  msgTest('user1', '昨日は１９：００に帰りました', ['@user1 1/1 19:00 退勤']);
  msgTest('user1', ':frog:', ['@user1 1/2 12:34 退勤']);
  msgTest('user1', 'get wild', ['@user1 1/2 12:34 退勤']);
  msgTest('user1', 'さよなら', ['@user1 1/2 12:34 退勤']);

  msgTest('user1', '休憩した', ['@user1 1/2 1:00 休憩']);
  msgTest('user1', 'ランチ 3:00', ['@user1 1/2 3:00 休憩']);
  msgTest('user1', ':bento: 昨日 2:00', ['@user1 1/1 2:00 休憩']);

  msgTest('user1', '12月はこれ https://docs.google.com/spreadsheets/d/1Iz7dh8OqseD3SaxhSHW_ZWIK_vRwNq5I--osPSnFTEM/edit#gid=1245018676', []);
  msgTest('app2641', '12月はこれ https://docs.google.com/spreadsheets/d/1Iz7dh8OqseD3SaxhSHW_ZWIK_vRwNq5I--osPSnFTEM/edit#gid=1245018676', ['@app2641 12月の業務日報を登録']);
  msgTest('user1', '12月の日報', ['@user1 https://docs.google.com/spreadsheets/d/spreadsheet_id/edit']);
  msgTest('user1', '12月の業務日報', ['@user1 https://docs.google.com/spreadsheets/d/spreadsheet_id/edit']);
});
