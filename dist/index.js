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
  var _replaces = [{
    from: '%20',
    to: ' '
  }];
  hash = {};
  var _done = false;
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

      if (!_done) return setTimeout(function () {
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
    _done = true;
    return null;
  }

  var hash = window.location.hash.replace('#!#', '').replace('#', '').split('&');

  for (var i = 0; i < hash.length; i++) {
    var holder = hash[i].split('=')[0];
    var value = hash[i].split('=')[1];

    for (var j = 0; j < _replaces.length; j++) {
      holder = holder.split(_replaces[j].from).join(_replaces[j].to);
      value = value.split(_replaces[j].from).join(_replaces[j].to);
    }

    hash[holder] = value;
  }

  _done = true;
  return null;
};

var Core_Service = function Core_Service() {
  var host = window.location.host.toLowerCase();
  var _afterWhile2 = {};
  var _cb = {};
  var _ids = {};
  var _done_next = {};
  window.core = {
    _serial_process: function (_serial_process2) {
      function _serial_process(_x, _x2, _x3) {
        return _serial_process2.apply(this, arguments);
      }

      _serial_process.toString = function () {
        return _serial_process2.toString();
      };

      return _serial_process;
    }(function (i, arr, callback) {
      if (i >= arr.length) return callback();
      arr[i](function () {
        _serial_process(++i, arr, callback);
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
      _serial_process(0, arr, callback);
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

            _serial_process(0, serialArr, callback);
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

            _serial_process(0, serialArr, callback);
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
    _afterWhile: function _afterWhile(doc, _cb, time) {
      if (time === void 0) {
        time = 1000;
      }

      if (typeof doc == 'function') {
        _cb = doc;
        doc = 'common';
      }

      if (typeof doc == 'string') {
        if (!_afterWhile2[doc]) _afterWhile2[doc] = {};
        doc = _afterWhile2[doc];
      }

      if (typeof _cb == 'function' && typeof time == 'number') {
        clearTimeout(doc.__updateTimeout);
        doc.__updateTimeout = setTimeout(_cb, time);
      }
    },
    emit: function emit(signal, doc) {
      if (doc === void 0) {
        doc = {};
      }

      if (!_cb[signal]) _cb[signal] = {};

      for (var each in _cb[signal]) {
        if (typeof _cb[signal][each] == 'function') {
          _cb[signal][each](doc);
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
    }(function (signal, _cb) {
      var id = Math.floor(Math.random() * Date.now()) + 1;
      if (_ids[id]) return on(signal, _cb);
      _ids[id] = true;
      if (!_cb[signal]) _cb[signal] = {};
      _cb[signal][id] = _cb;
      return function () {
        _cb[signal][id] = null;
      };
    }),
    done: function done(signal) {
      _done_next[signal] = true;
    },
    ready: function ready(signal) {
      return _done_next[signal];
    },
    next: function (_next) {
      function next(_x6, _x7) {
        return _next.apply(this, arguments);
      }

      next.toString = function () {
        return _next.toString();
      };

      return next;
    }(function (signal, _cb) {
      if (_done_next[signal]) _cb();else {
        return setTimeout(function () {
          next(signal, _cb);
        }, 100);
      }
    })
  };
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/windows phone/i.test(userAgent)) ; else if (/android/i.test(userAgent)) ; else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) ;

  core.set_version();
  return null;
};

var _this = undefined;

var Store_Service = function Store_Service(config) {
  if (config === void 0) {
    config = {};
  }

  var _db = null;
  var _data = {};
  var tempConfig = JSON.parse(JSON.stringify(config));
  var _id = '_id';
  if (!tempConfig.database) tempConfig.database = {};
  if (tempConfig.database._id) _id = tempConfig.database._id;

  if (Array.isArray(tempConfig.database.collections)) {
    for (var i = 0; i < tempConfig.database.collections.length; i++) {
      _initialize(tempConfig.database.collections[i]);
    }
  }

  document.addEventListener('deviceready', function () {
    if (window.sqlitePlugin) {
      _db = window.sqlitePlugin.openDatabase({
        location: 'default',
        name: 'data'
      });
      if (!_db) return;

      _db.transaction(function (tx) {
        tx.executeSql('CREATE TABLE IF NOT EXISTS Data (hold, value)');
        tx.executeSql("INSERT INTO Data (hold, value) VALUES (?,?)", ["test", "100"], function (tx, res) {}, function (e) {});
      }, function (error) {}, function () {});
    }
  });

  var sort = function sort(arr, _sort) {
    if (!Array.isArray(arr)) return;
    if (typeof _sort == 'string' && typeof window.store[_sort] == 'function') arr.sort(window.store[_sort]);else if (typeof _sort == 'function') arr.sort(_sort);
  };

  window.store = {
    set: function (_set) {
      function set(_x, _x2) {
        return _set.apply(this, arguments);
      }

      set.toString = function () {
        return _set.toString();
      };

      return set;
    }(function (hold, value, cb, errCb) {
      if (cb === void 0) {
        cb = function cb() {};
      }

      if (errCb === void 0) {
        errCb = function errCb() {};
      }

      if (window.sqlitePlugin) {
        if (!_db) {
          return setTimeout(function () {
            set(hold, value, cb);
          }, 100);
        }

        get(hold, function (resp) {
          if (resp) {
            _db.transaction(function (tx) {
              tx.executeSql("UPDATE Data SET value=? WHERE hold=?", [value, hold], cb, cb);
            }, errCb);
          } else {
            _db.transaction(function (tx) {
              tx.executeSql('INSERT INTO Data (hold, value) VALUES (?, ?)', [hold, value], cb, cb);
            }, errCb);
          }
        });
      } else {
        try {
          localStorage.setItem('waw_temp_storage_' + hold, value);
        } catch (e) {
          errCb();
        }

        cb();
      }
    }),
    get: function (_get) {
      function get(_x3) {
        return _get.apply(this, arguments);
      }

      get.toString = function () {
        return _get.toString();
      };

      return get;
    }(function (hold, cb, errcb) {
      if (cb === void 0) {
        cb = function cb() {};
      }

      if (errcb === void 0) {
        errcb = function errcb() {};
      }

      if (window.sqlitePlugin) {
        if (!_db) {
          return setTimeout(function () {
            get(hold, cb);
          }, 100);
        }

        _db.executeSql('SELECT value FROM Data where hold=?', [hold], function (rs) {
          if (rs.rows && rs.rows.length) {
            cb(rs.rows.item(0).value);
          } else {
            cb('');
          }
        }, errcb);
      } else {
        cb(localStorage.getItem('waw_temp_storage_' + hold) || '');
      }
    }),
    remove: function (_remove) {
      function remove(_x4) {
        return _remove.apply(this, arguments);
      }

      remove.toString = function () {
        return _remove.toString();
      };

      return remove;
    }(function (hold, cb, errcb) {
      if (cb === void 0) {
        cb = function cb() {};
      }

      if (errcb === void 0) {
        errcb = function errcb() {};
      }

      if (window.sqlitePlugin) {
        if (!_db) return setTimeout(function () {
          remove(hold);
        }, 100);

        _db.executeSql('DELETE FROM Data where hold=?', [hold], cb, errcb);
      } else {
        localStorage.removeItem('waw_temp_storage_' + hold);
        cb();
      }
    }),
    clear: function (_clear) {
      function clear() {
        return _clear.apply(this, arguments);
      }

      clear.toString = function () {
        return _clear.toString();
      };

      return clear;
    }(function (cb, errcb) {
      if (cb === void 0) {
        cb = function cb() {};
      }

      if (errcb === void 0) {
        errcb = function errcb() {};
      }

      localStorage.clear();

      if (window.sqlitePlugin) {
        if (!db) {
          return setTimeout(function () {
            clear();
          }, 100);
        }

        _db.executeSql('DROP TABLE IF EXISTS Data', [], function (rs) {
          _db.executeSql('CREATE TABLE IF NOT EXISTS Data (hold, value)', [], cb, errcb);
        }, errcb);
      }
    }),
    _set_docs: function _set_docs(type) {
      var docs = [];

      for (var each in _data[type].by_id) {
        docs.push(each);
      }

      set(type + '_docs', JSON.stringify(docs));
    },
    _add_doc: function _add_doc(type, doc) {
      for (var each in doc) {
        _data[type].by_id[doc[_id]][each] = doc[each];
      }

      var add = true;

      _data[type].all.forEach(function (selected) {
        if (selected[_id] == doc[_id]) add = false;
      });

      if (add) _data[type].all.push(_data[type].by_id[doc[_id]]);
      if (_data[type].sort) sort(_data[type].all, _data[type].sort);

      if (_data[type].opts.query) {
        for (var key in _data[type].opts.query) {
          var query = _data[type].opts.query[key];
          if (typeof query.ignore == 'function' && query.ignore(doc)) continue;
          if (typeof query.allow == 'function' && !query.allow(doc)) continue;

          if (!_data[type].query[key]) {
            _data[type].query[key] = [];
          }

          add = true;

          _data[type].query.forEach(function (selected) {
            if (selected[_id] == doc[_id]) add = false;
          });

          if (add) _data[type].query[key].push(_data[type].by_id[doc[_id]]);
          if (query.sort) sort(_data[type].query[key], query.sort);
        }
      }

      if (_data[type].opts.groups) {
        var _loop = function _loop(_key) {
          var groups = _data[type].opts.groups[_key];
          if (typeof groups.ignore == 'function' && groups.ignore(doc)) return "continue";
          if (typeof groups.allow == 'function' && !groups.allow(doc)) return "continue";

          if (!_data[type].groups[_key]) {
            _data[type].groups[_key] = {};
          }

          var set = function set(field) {
            if (!field) return;

            if (!Array.isArray(_data[type].groups[_key][field])) {
              _data[type].groups[_key][field] = [];
            }

            add = true;

            _data[type].groups.forEach(function (selected) {
              if (selected[_id] == doc[_id]) add = false;
            });

            if (add) _data[type].groups[_key][field].push(_data[type].by_id[doc[_id]]);
            if (groups.sort) sort(_data[type].groups[_key][field], groups.sort);
          };

          set(groups.field(doc, function (field) {
            set(field);
          }));
        };

        for (var _key in _data[type].opts.groups) {
          var _ret = _loop(_key);

          if (_ret === "continue") continue;
        }
      }
    },
    _initialize: function _initialize(collection) {
      if (!collection.all) collection.all = [];
      if (!collection.opts) collection.opts = {};
      if (!collection.by_id) collection.by_id = {};
      if (!collection.groups) collection.groups = {};
      if (!collection.query) collection.query = [];

      if (collection.opts.query) {
        for (var key in collection.opts.query) {
          if (typeof collection.opts.query[key] == 'function') {
            collection.opts.query[key] = {
              allow: collection.opts.query[key]
            };
          }
        }
      }

      if (collection.opts.groups) {
        if (typeof collection.opts.groups == 'string') {
          collection.opts.groups = collection.opts.groups.split(' ');
        }

        var _loop2 = function _loop2(_key2) {
          if (typeof collection.opts.groups[_key2] == 'boolean' && collection.opts.groups[_key2]) {
            collection.opts.groups[_key2] = {
              field: function field(doc) {
                return doc[_key2];
              }
            };
          }

          if (typeof collection.opts.groups[_key2] != 'object' || typeof collection.opts.groups[_key2].field != 'function') {
            delete collection.opts.groups[_key2];
            return "continue";
          }

          collection.groups[_key2] = {};
        };

        for (var _key2 in collection.opts.groups) {
          var _ret2 = _loop2(_key2);

          if (_ret2 === "continue") continue;
        }
      }

      _data[collection.name] = collection;
      get(collection.name + '_docs', function (docs) {
        if (!docs) return;
        docs = JSON.parse(docs);

        for (var _i = 0; _i < docs.length; _i++) {
          _add_doc(collection.name, get_doc(collection.name, docs[_i]));
        }
      });
    },
    all: function all(type, doc) {
      return _data[type].all;
    },
    query: function query(type, doc) {
      return _data[type].query;
    },
    groups: function groups(type, doc) {
      return _data[type].groups;
    },
    get_doc: function get_doc(type, _id) {
      if (!_data[type].by_id[_id]) {
        _data[type].by_id[_id] = {};
        _data[type].by_id[_id][_this._id] = _id;
        get(type + '_' + _id, function (doc) {
          if (!doc) return;

          for (var each in doc) {
            _data[type].by_id[_id][each] = doc[each];
          }
        });
      }

      return _data[type].by_id[_id];
    },
    replace: function replace(doc, each, exe) {
      doc[each] = exe(doc, function (value) {
        doc[each] = value;
      });
    },
    set_doc: function set_doc(type, doc) {
      if (!_data[type].by_id[doc[_id]]) {
        _data[type].by_id[doc[_id]] = {};
      }

      if (typeof _data[type].opts.replace == 'function') {
        doc = _data[type].opts.replace(doc);
      } else if (typeof _data[type].opts.replace == 'object') {
        for (var each in _data[type].opts.replace) {
          if (typeof _data[type].opts.replace[each] == 'function') {
            replace(doc, each, _data[type].opts.replace[each]);
          }
        }
      }

      set(type + '_' + doc[_id], doc);

      _add_doc(type, doc);

      _set_docs(type);

      return _data[type].by_id[doc[_id]];
    },
    remove_doc: function remove_doc(type, _id) {
      remove(type + '_' + _id);
      delete data[type].by_id[_id];
      store_docs(type);
    },
    sortAscId: function sortAscId(id) {
      if (id === void 0) {
        id = '_id';
      }

      return function (a, b) {
        if (a[id] > b[id]) return 1;else return -1;
      };
    },
    sortDescId: function sortDescId(id) {
      if (id === void 0) {
        id = '_id';
      }

      return function (a, b) {
        if (a[id] < b[id]) return 1;else return -1;
      };
    },
    sortAscString: function sortAscString(opts) {
      if (typeof opts == 'string') {
        opts = {
          field: opts
        };
      }

      return function (a, b) {
        if (a[opts.field].toLowerCase() > b[opts.field].toLowerCase()) return 1;else if (a[opts.field].toLowerCase() < b[opts.field].toLowerCase() || !opts.next) return -1;else return opts.next(a, b);
      };
    },
    sortDescString: function sortDescString(opts) {
      if (typeof opts == 'string') {
        opts = {
          field: opts
        };
      }

      return function (a, b) {
        if (a[opts.field].toLowerCase() < b[opts.field].toLowerCase()) return 1;else if (a[opts.field].toLowerCase() > b[opts.field].toLowerCase() || !opts.next) return -1;else return opts.next(a, b);
      };
    },
    sortAscDate: function sortAscDate(opts) {
      if (typeof opts == 'string') {
        opts = {
          field: opts
        };
      }

      return function (a, b) {
        if (a[opts.field].getTime() > b[opts.field].getTime()) return 1;else if (a[opts.field].getTime() < b[opts.field].getTime() || !opts.next) return -1;else return opts.next(a, b);
      };
    },
    sortDescDate: function sortDescDate(opts) {
      if (typeof opts == 'string') {
        opts = {
          field: opts
        };
      }

      return function (a, b) {
        if (a[opts.field].getTime() < b[opts.field].getTime()) return 1;else if (a[opts.field].getTime() > b[opts.field].getTime() || !opts.next) return -1;else return opts.next(a, b);
      };
    },
    sortAscNumber: function sortAscNumber(opts) {
      if (typeof opts == 'string') {
        opts = {
          field: opts
        };
      }

      return function (a, b) {
        if (a[opts.field] > b[opts.field]) return 1;else if (a[opts.field] < b[opts.field] || !opts.next) return -1;else return opts.next(a, b);
      };
    },
    sortDescNumber: function sortDescNumber(opts) {
      if (typeof opts == 'string') {
        opts = {
          field: opts
        };
      }

      return function (a, b) {
        if (a[opts.field] < b[opts.field]) return 1;else if (a[opts.field] > b[opts.field] || !opts.next) return -1;else return opts.next(a, b);
      };
    },
    sortAscBoolean: function sortAscBoolean(opts) {
      if (typeof opts == 'string') {
        opts = {
          field: opts
        };
      }

      return function (a, b) {
        if (!a[opts.field] && b[opts.field]) return 1;else if (a[opts.field] && !b[opts.field] || !opts.next) return -1;else return opts.next(a, b);
      };
    },
    sortDescBoolean: function sortDescBoolean(opts) {
      if (typeof opts == 'string') {
        opts = {
          field: opts
        };
      }

      return function (a, b) {
        if (a[opts.field] && !b[opts.field]) return 1;else if (!a[opts.field] && b[opts.field] || !opts.next) return -1;else return opts.next(a, b);
      };
    }
  };
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
var StoreService = function StoreService() {
  return /*#__PURE__*/React.createElement(Store_Service, null);
};

exports.CoreService = CoreService;
exports.HashService = HashService;
exports.HttpService = HttpService;
exports.RenderService = RenderService;
exports.StoreService = StoreService;
//# sourceMappingURL=index.js.map
