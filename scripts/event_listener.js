/**
 * EventListener
 * Copyright (c) 2016 app2641
 */

loadEventListener = function () {
  var EventListener = function () {
    this.events = {};
  };

  EventListener.prototype.on = function (event_name, func) {
    if (this.events[event_name]) {
      this.events[event_name].push(func);
    } else {
      this.events[event_name] = [func];
    }
  };

  EventListener.prototype.fireEvent = function (event_name) {
    var funcs = this.events[event_name];
    if (funcs) {
      for (var i = 0; i < funcs.length; ++i) {
        funcs[i].apply(this, Array.prototype.slice.call(arguments, 1));
      }
    }
  };

  return EventListener;
};

if (typeof exports !== 'undefined') {
  exports.EventListener = loadEventListener();
}
