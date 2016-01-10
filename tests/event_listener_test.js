QUnit.test( "EventListener", function (assert) {
  var results = [];

  var obj = new EventListener();
  obj.on('test1', function (e) {
    results.push('TEST1');
  });

  obj.on('test2', function (e) {
    results.push('TEST2');
  });

  obj.fireEvent('test1');
  assert.ok(results.length == 1 && results[0] == 'TEST1');

  obj.fireEvent('test2');
  assert.ok(results.length == 2 && results[0] == 'TEST1' && results[1] == 'TEST2');

  obj.fireEvent('test1');
  assert.ok(results.length == 3 && results[0] == 'TEST1' && results[1] == 'TEST2' && results[2] == 'TEST1');
});
