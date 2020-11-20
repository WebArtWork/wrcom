function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));

var HTTP = function HTTP() {
  window.http = {
    post: function post(url, doc, callback, opts) {
      if (callback === void 0) {
        callback = function callback(resp) {};
      }

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(doc)
      }).then(function (resp) {
        return resp.json();
      }).then(callback);
    },
    get: function get(url, callback, opts) {
      if (callback === void 0) {
        callback = function callback(resp) {};
      }

      fetch(url, {
        method: 'GET'
      }).then(function (resp) {
        return resp.json();
      }).then(callback);
    }
  };
  return null;
};

var Render = function Render() {
  var places = {};
  window.render = {
    call: function call(place) {
      if (place === void 0) {
        place = '';
      }

      if (place && typeof places[place] == 'function') places[place]();else if (!place) {
        for (var each in places) {
          if (typeof places[each] == 'function') places[each]();
        }
      }
    },
    add: function add(place, render) {
      if (places[place]) {
        return console.log('You already have this place');
      }

      places[place] = render;
    }
  };
  return null;
};

var Hash_Service = function Hash_Service() {
  var replaces = [{
    from: '%20',
    to: ' '
  }];
  hash = {};
  var done = false;
  window.hash = {
    on: function (_on) {
      function on(_x) {
        return _on.apply(this, arguments);
      }

      on.toString = function () {
        return _on.toString();
      };

      return on;
    }(function (field, cb) {
      if (cb === void 0) {
        cb = function cb(resp) {};
      }

      if (!done) return setTimeout(function () {
        on(field, cb);
      }, 100);
      cb(hash[field]);
    }),
    save: function save() {
      var hash = '';

      for (var each in hash) {
        if (hash) hash += '&';
        hash += each + '=' + hash[each];
      }

      window.location.hash = hash;
    },
    set: function set(field, value) {
      hash[field] = value;
      save();
    },
    get: function get(field) {
      return hash[field];
    },
    clear: function clear(field) {
      delete hash[field];
      save();
    }
  };

  if (!window.location.hash) {
    done = true;
    return null;
  }

  var hash = window.location.hash.replace('#!#', '').replace('#', '').split('&');

  for (var i = 0; i < hash.length; i++) {
    var holder = hash[i].split('=')[0];
    var value = hash[i].split('=')[1];

    for (var j = 0; j < replaces.length; j++) {
      holder = holder.split(replaces[j].from).join(replaces[j].to);
      value = value.split(replaces[j].from).join(replaces[j].to);
    }

    hash[holder] = value;
  }

  done = true;
  return null;
};

var Core_Service = function Core_Service() {
  var host = window.location.host.toLowerCase();
  var _afterWhile = {};
  var cb = {};
  var _ids = {};
  var done_next = {};
  window.core = {
    serial_process: function (_serial_process) {
      function serial_process(_x, _x2, _x3) {
        return _serial_process.apply(this, arguments);
      }

      serial_process.toString = function () {
        return _serial_process.toString();
      };

      return serial_process;
    }(function (i, arr, callback) {
      if (i >= arr.length) return callback();
      arr[i](function () {
        serial_process(++i, arr, callback);
      });
    }),
    set_version: function set_version(version) {
      document.addEventListener('deviceready', function () {
        done('mobile');

        if (cordova && cordova.getAppVersion) {
          cordova.getAppVersion.getVersionNumber(function (version) {
          });
        }
      });
    },
    parallel: function parallel(arr, callback) {
      var counter = arr.length;
      if (counter === 0) return callback();

      for (var i = 0; i < arr.length; i++) {
        arr[i](function () {
          if (--counter === 0) callback();
        });
      }
    },
    serial: function serial(arr, callback) {
      serial_process(0, arr, callback);
    },
    each: function each(arrOrObj, func, callback, isSerial) {
      if (isSerial === void 0) {
        isSerial = false;
      }

      if (typeof callback == 'boolean') {
        isSerial = callback;

        callback = function callback() {};
      }

      if (Array.isArray(arrOrObj)) {
        var _ret = function () {
          var counter = arrOrObj.length;
          if (counter === 0) return {
            v: callback()
          };

          if (isSerial) {
            var serialArr = [];

            var _loop = function _loop(i) {
              serialArr.push(function (next) {
                func(arrOrObj[i], function () {
                  if (--counter === 0) callback();else next();
                }, i);
              });
            };

            for (var i = 0; i < arrOrObj.length; i++) {
              _loop(i);
            }

            serial_process(0, serialArr, callback);
          } else {
            for (var _i = 0; _i < arrOrObj.length; _i++) {
              func(arrOrObj[_i], function () {
                if (--counter === 0) callback();
              }, _i);
            }
          }
        }();

        if (typeof _ret === "object") return _ret.v;
      } else if (typeof arrOrObj == 'object') {
        if (isSerial) {
          (function () {
            var serialArr = [];
            var arr = [];

            for (var each in arrOrObj) {
              arr.push({
                value: arrOrObj[each],
                each: each
              });
            }
            var counter = arr.length;

            var _loop2 = function _loop2(i) {
              serialArr.push(function (next) {
                func(arr[i].each, arr[i].value, function () {
                  if (--counter === 0) callback();else next();
                }, i);
              });
            };

            for (var i = 0; i < arr.length; i++) {
              _loop2(i);
            }

            serial_process(0, serialArr, callback);
          })();
        } else {
          (function () {
            var counter = 1;

            for (var each in arrOrObj) {
              counter++;
              func(each, arrOrObj[each], function () {
                if (--counter === 0) callback();
              });
            }

            if (--counter === 0) callback();
          })();
        }
      } else callback();
    },
    afterWhile: function afterWhile(doc, cb, time) {
      if (time === void 0) {
        time = 1000;
      }

      if (typeof doc == 'function') {
        cb = doc;
        doc = 'common';
      }

      if (typeof doc == 'string') {
        if (!_afterWhile[doc]) _afterWhile[doc] = {};
        doc = _afterWhile[doc];
      }

      if (typeof cb == 'function' && typeof time == 'number') {
        clearTimeout(doc.__updateTimeout);
        doc.__updateTimeout = setTimeout(cb, time);
      }
    },
    emit: function emit(signal, doc) {
      if (doc === void 0) {
        doc = {};
      }

      if (!cb[signal]) cb[signal] = {};

      for (var each in cb[signal]) {
        if (typeof cb[signal][each] == 'function') {
          cb[signal][each](doc);
        }
      }
    },
    on: function (_on) {
      function on(_x4, _x5) {
        return _on.apply(this, arguments);
      }

      on.toString = function () {
        return _on.toString();
      };

      return on;
    }(function (signal, cb) {
      var id = Math.floor(Math.random() * Date.now()) + 1;
      if (_ids[id]) return on(signal, cb);
      _ids[id] = true;
      if (!cb[signal]) cb[signal] = {};
      cb[signal][id] = cb;
      return function () {
        cb[signal][id] = null;
      };
    }),
    done: function done(signal) {
      done_next[signal] = true;
    },
    ready: function ready(signal) {
      return done_next[signal];
    },
    next: function (_next) {
      function next(_x6, _x7) {
        return _next.apply(this, arguments);
      }

      next.toString = function () {
        return _next.toString();
      };

      return next;
    }(function (signal, cb) {
      if (done_next[signal]) cb();else {
        return setTimeout(function () {
          next(signal, cb);
        }, 100);
      }
    })
  };
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/windows phone/i.test(userAgent)) ; else if (/android/i.test(userAgent)) ; else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) ;

  core.set_version();
  return null;
};

var HttpService = function HttpService() {
  return /*#__PURE__*/React.createElement(HTTP, null);
};
var RenderService = function RenderService() {
  return /*#__PURE__*/React.createElement(Render, null);
};
var HashService = function HashService() {
  return /*#__PURE__*/React.createElement(Hash_Service, null);
};
var CoreService = function CoreService() {
  return /*#__PURE__*/React.createElement(Core_Service, null);
};

exports.CoreService = CoreService;
exports.HashService = HashService;
exports.HttpService = HttpService;
exports.RenderService = RenderService;
//# sourceMappingURL=index.js.map
