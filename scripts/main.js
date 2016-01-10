
var initLibraries = function () {
  if (typeof GlobalSettings === 'undefined') GlobalSettings = loadGlobalSettings();
  if (typeof Runner === 'undefined') Runner = loadRunner();
  if (typeof Settings === 'undefined') Settings = loadSettings();
  if (typeof Slack === 'undefined') Slack = loadSlack();
  if (typeof Templates === 'undefined') Templates = loadTemplates();
  if (typeof Timesheets === 'undefined') Timesheets = loadTimesheets();
  if(typeof DateUtils === 'undefined') DateUtils = loadDateUtils();
};

var init = function () {
  initLibraries();

  var global_settings = new GlobalSettings();
  var ss_id = global_settings.get('spreadsheet_id');
  if (ss_id) {
    var ss = SpreadsheetApp.openById(ss_id);
    var settings = new Settings(ss);
    var templates = new Templates();
    var slack = new Slack(settings.get('Settings', 'SlackUrl'), templates, settings);
    var timesheets = new Timesheets(settings);
    var runner = new Runner(settings, timesheets, templates, slack);

    return {
      receiver: slack,
      runner: runner,
      timesheets: timesheets
    };
  }

  return null;
}

function doPost (e) {
  var bot = init();
  bot.receiver.receiveMessage(e.parameters);
}

function setUp () {
  initLibraries();

  var global_settings = new GlobalSettings();
  if (!global_settings.get('spreadsheet_id')) {
    var ss = SpreadsheetApp.create('TimeSetting');
    ss.getSheets()[0].setName('Settings');
    ss.insertSheet('TimeSheets');
    ss.insertSheet('Users');
    global_settings.set('spreadsheet_id', ss.getId());

    var settings = new Settings(ss);
    settings.set('Settings', 'SlackUrl', '');
    Logger.log(settings.get('Settings', 'SlackUrl'));
  }
};

function test () {
  var bot = init();
  var global_settings = new GlobalSettings();

  if (global_settings.get('spreadsheet_id')) {
    // global_settings.destroy('spreadsheet_id');
  }
  bot.receiver.receiveMessage({user_name:"app2641", text:"おは 12/1 8:00"});
}
