QUnit.test('Slack', function (assert) {
  var settings = {
    get: function (sheet, key) {
      return 'spreadsheet_id';
    }
  };

  var templates;
  var slack_url = 'http://example.com';

  var messages = [];
  var clearMessages = function () {
    messages = [];
  };

  var slack = new Slack(slack_url, template, settings);
  slack.on('receiveMessage', function (username, message) {
    messages.push(message);
  });

  clearMessages();
  slack.receiveMessage({user_name: 'ap2641', text: '# おつ'});
  assert.ok(_.isEqual(messages, []));

  clearMessages();
  slack.receiveMessage({user_name: 'ap2641', text: 'おつ'});
  assert.ok(_.isEqual(messages, ['おつ']));

  UrlFetchApp = {
    fetch: function () {}
  };
  var message = {user_name: 'app2641', text: 'おつ'};
  assert.ok(_.isEqual(slack.send(message), message));
});
