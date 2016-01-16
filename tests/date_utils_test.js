QUnit.test("DateUtils.parseTime", function (assert) {
  assert.ok(_.isEqual('13:01', DateUtils.parseTime("13:01")));
  assert.ok(_.isEqual('14:02', DateUtils.parseTime("2:02pm")));
  assert.ok(_.isEqual('16:03', DateUtils.parseTime("午後4:3")));
  assert.ok(_.isEqual('17:00', DateUtils.parseTime("5pm")));
  assert.ok(_.isEqual('17:01', DateUtils.parseTime("5:1pm")));
  assert.ok(_.isEqual('18:00', DateUtils.parseTime("18時")));
  assert.ok(_.isEqual('19:20', DateUtils.parseTime("19 : 20")));
  assert.ok(_.isEqual('20:00', DateUtils.parseTime("午後８")));
  assert.ok(_.isEqual('21:00', DateUtils.parseTime("午後９：００")));

  assert.ok(_.isEqual(undefined, DateUtils.parseTime("12/1")));
});

QUnit.test( "DateUtils.parseDate", function (assert) {
  assert.ok(_.isEqual([12, 1], DateUtils.parseDate("12/1")));
  assert.ok(_.isEqual([1, 1], DateUtils.parseDate("1/1")));
  assert.ok(_.isEqual([2, 3], DateUtils.parseDate("2月3日")));
  assert.ok(_.isEqual([1, 1], DateUtils.parseDate("2020/1/1")));
  assert.ok(_.isEqual([2, 8], DateUtils.parseDate("1976年2月8日")));

  DateUtils.now(new Date(2016, 1-1, 1, 0, 0, 0));
  assert.ok(_.isEqual([12, 31], DateUtils.parseDate("昨日")));
  assert.ok(_.isEqual([1, 1], DateUtils.parseDate("今日")));
  assert.ok(_.isEqual([1, 2], DateUtils.parseDate("明日")));
  assert.ok(_.isEqual([12, 31], DateUtils.parseDate("yesterday")));
  assert.ok(_.isEqual([1, 1], DateUtils.parseDate("today")));
  assert.ok(_.isEqual([1, 2], DateUtils.parseDate("tomorrow")));

  assert.ok(_.isEqual(undefined, DateUtils.parseDate("19:00")));
});

QUnit.test('DateUtils.today', function (assert) {
  DateUtils.now(new Date(2016, 1-1, 1, 0, 0, 0));
  assert.ok(_.isEqual([1, 1], DateUtils.today()));
});

QUnit.test('DateUtils.nowtime', function (assert) {
  DateUtils.now(new Date(2016, 1-1, 1, 8, 4, 0));
  assert.ok(_.isEqual('8:04', DateUtils.nowtime()));
});
