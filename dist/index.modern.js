import React from 'react';

const HTTP = () => {
  window.http = {
    post: (url, doc, callback = resp => {}, opts = {}) => {
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(doc)
      }).then(resp => {
        return resp.json();
      }).then(callback);
    },
    get: (url, callback = resp => {}, opts = {}) => {
      fetch(url, {
        method: 'GET'
      }).then(resp => {
        return resp.json();
      }).then(callback);
    }
  };
  return null;
};

const Render = () => {
  const places = {};
  window.render = {
    call: (place = '') => {
      if (place && typeof places[place] == 'function') places[place]();else if (!place) {
        for (let each in places) {
          if (typeof places[each] == 'function') places[each]();
        }
      }
    },
    add: (place, render) => {
      if (places[place]) {
        return console.log('You already have this place');
      }

      places[place] = render;
    }
  };
  return null;
};

const Hash_Service = () => {
  const _replaces = [{
    from: '%20',
    to: ' '
  }];
  hash = {};
  let _done = false;
  window.hash = {
    on: (field, cb = resp => {}) => {
      if (!_done) return setTimeout(() => {
        on(field, cb);
      }, 100);
      cb(hash[field]);
    },
    save: () => {
      let hash = '';

      for (let each in hash) {
        if (hash) hash += '&';
        hash += each + '=' + hash[each];
      }

      window.location.hash = hash;
    },
    set: (field, value) => {
      hash[field] = value;
      save();
    },
    get: field => {
      return hash[field];
    },
    clear: field => {
      delete hash[field];
      save();
    }
  };

  if (!window.location.hash) {
    _done = true;
    return null;
  }

  let hash = window.location.hash.replace('#!#', '').replace('#', '').split('&');

  for (let i = 0; i < hash.length; i++) {
    let holder = hash[i].split('=')[0];
    let value = hash[i].split('=')[1];

    for (let j = 0; j < _replaces.length; j++) {
      holder = holder.split(_replaces[j].from).join(_replaces[j].to);
      value = value.split(_replaces[j].from).join(_replaces[j].to);
    }

    hash[holder] = value;
  }

  _done = true;
  return null;
};

const Core_Service = () => {
  let host = window.location.host.toLowerCase();
  let _afterWhile = {};
  let _cb = {};
  let _ids = {};
  let _done_next = {};
  window.core = {
    _serial_process: (i, arr, callback) => {
      if (i >= arr.length) return callback();
      arr[i](() => {
        _serial_process(++i, arr, callback);
      });
    },
    set_version: (version = '1.0.0') => {
      version = version;
      document.addEventListener('deviceready', () => {
        done('mobile');

        if (cordova && cordova.getAppVersion) {
          cordova.getAppVersion.getVersionNumber(version => {
          });
        }
      });
    },
    parallel: (arr, callback) => {
      let counter = arr.length;
      if (counter === 0) return callback();

      for (let i = 0; i < arr.length; i++) {
        arr[i](function () {
          if (--counter === 0) callback();
        });
      }
    },
    serial: (arr, callback) => {
      _serial_process(0, arr, callback);
    },
    each: (arrOrObj, func, callback, isSerial = false) => {
      if (typeof callback == 'boolean') {
        isSerial = callback;

        callback = () => {};
      }

      if (Array.isArray(arrOrObj)) {
        let counter = arrOrObj.length;
        if (counter === 0) return callback();

        if (isSerial) {
          let serialArr = [];

          for (let i = 0; i < arrOrObj.length; i++) {
            serialArr.push(function (next) {
              func(arrOrObj[i], function () {
                if (--counter === 0) callback();else next();
              }, i);
            });
          }

          _serial_process(0, serialArr, callback);
        } else {
          for (let i = 0; i < arrOrObj.length; i++) {
            func(arrOrObj[i], function () {
              if (--counter === 0) callback();
            }, i);
          }
        }
      } else if (typeof arrOrObj == 'object') {
        if (isSerial) {
          let serialArr = [];
          let arr = [];

          for (let each in arrOrObj) {
            arr.push({
              value: arrOrObj[each],
              each: each
            });
          }

          let counter = arr.length;

          for (let i = 0; i < arr.length; i++) {
            serialArr.push(function (next) {
              func(arr[i].each, arr[i].value, function () {
                if (--counter === 0) callback();else next();
              }, i);
            });
          }

          _serial_process(0, serialArr, callback);
        } else {
          let counter = 1;

          for (let each in arrOrObj) {
            counter++;
            func(each, arrOrObj[each], function () {
              if (--counter === 0) callback();
            });
          }

          if (--counter === 0) callback();
        }
      } else callback();
    },
    _afterWhile: (doc, _cb, time = 1000) => {
      if (typeof doc == 'function') {
        _cb = doc;
        doc = 'common';
      }

      if (typeof doc == 'string') {
        if (!_afterWhile[doc]) _afterWhile[doc] = {};
        doc = _afterWhile[doc];
      }

      if (typeof _cb == 'function' && typeof time == 'number') {
        clearTimeout(doc.__updateTimeout);
        doc.__updateTimeout = setTimeout(_cb, time);
      }
    },
    emit: (signal, doc = {}) => {
      if (!_cb[signal]) _cb[signal] = {};

      for (let each in _cb[signal]) {
        if (typeof _cb[signal][each] == 'function') {
          _cb[signal][each](doc);
        }
      }
    },
    on: (signal, _cb) => {
      let id = Math.floor(Math.random() * Date.now()) + 1;
      if (_ids[id]) return on(signal, _cb);
      _ids[id] = true;
      if (!_cb[signal]) _cb[signal] = {};
      _cb[signal][id] = _cb;
      return () => {
        _cb[signal][id] = null;
      };
    },
    done: signal => {
      _done_next[signal] = true;
    },
    ready: signal => {
      return _done_next[signal];
    },
    next: (signal, _cb) => {
      if (_done_next[signal]) _cb();else {
        return setTimeout(() => {
          next(signal, _cb);
        }, 100);
      }
    }
  };
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/windows phone/i.test(userAgent)) ; else if (/android/i.test(userAgent)) ; else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) ;

  core.set_version();
  return null;
};

const Store_Service = (config = {}) => {
  let _db = null;
  let _data = {};
  let tempConfig = JSON.parse(JSON.stringify(config));
  let _id = '_id';
  if (!tempConfig.database) tempConfig.database = {};
  if (tempConfig.database._id) _id = tempConfig.database._id;

  if (Array.isArray(tempConfig.database.collections)) {
    for (let i = 0; i < tempConfig.database.collections.length; i++) {
      _initialize(tempConfig.database.collections[i]);
    }
  }

  document.addEventListener('deviceready', () => {
    if (window.sqlitePlugin) {
      _db = window.sqlitePlugin.openDatabase({
        location: 'default',
        name: 'data'
      });
      if (!_db) return;

      _db.transaction(tx => {
        tx.executeSql('CREATE TABLE IF NOT EXISTS Data (hold, value)');
        tx.executeSql("INSERT INTO Data (hold, value) VALUES (?,?)", ["test", "100"], (tx, res) => {}, e => {});
      }, error => {}, () => {});
    }
  });
  window.store = {
    set: (hold, value, cb = () => {}, errCb = () => {}) => {
      if (window.sqlitePlugin) {
        if (!_db) {
          return setTimeout(() => {
            set(hold, value, cb);
          }, 100);
        }

        get(hold, resp => {
          if (resp) {
            _db.transaction(tx => {
              tx.executeSql("UPDATE Data SET value=? WHERE hold=?", [value, hold], cb, cb);
            }, errCb);
          } else {
            _db.transaction(tx => {
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
    },
    get: (hold, cb = () => {}, errcb = () => {}) => {
      if (window.sqlitePlugin) {
        if (!_db) {
          return setTimeout(() => {
            get(hold, cb);
          }, 100);
        }

        _db.executeSql('SELECT value FROM Data where hold=?', [hold], rs => {
          if (rs.rows && rs.rows.length) {
            cb(rs.rows.item(0).value);
          } else {
            cb('');
          }
        }, errcb);
      } else {
        cb(localStorage.getItem('waw_temp_storage_' + hold) || '');
      }
    },
    remove: (hold, cb = () => {}, errcb = () => {}) => {
      if (window.sqlitePlugin) {
        if (!_db) return setTimeout(() => {
          remove(hold);
        }, 100);

        _db.executeSql('DELETE FROM Data where hold=?', [hold], cb, errcb);
      } else {
        localStorage.removeItem('waw_temp_storage_' + hold);
        cb();
      }
    },
    clear: (cb = () => {}, errcb = () => {}) => {
      localStorage.clear();

      if (window.sqlitePlugin) {
        if (!db) {
          return setTimeout(() => {
            clear();
          }, 100);
        }

        _db.executeSql('DROP TABLE IF EXISTS Data', [], rs => {
          _db.executeSql('CREATE TABLE IF NOT EXISTS Data (hold, value)', [], cb, errcb);
        }, errcb);
      }
    },
    _set_docs: type => {
      let docs = [];

      for (let each in _data[type].by_id) {
        docs.push(each);
      }

      set(type + '_docs', JSON.stringify(docs));
    },
    _add_doc: (type, doc) => {
      for (let each in doc) {
        _data[type].by_id[doc[_id]][each] = doc[each];
      }

      let add = true;

      _data[type].all.forEach(selected => {
        if (selected[_id] == doc[_id]) add = false;
      });

      if (add) _data[type].all.push(_data[type].by_id[doc[_id]]);
    },
    _initialize: collection => {
      if (!collection.all) collection.all = [];
      if (!collection.by_id) collection.by_id = {};
      _data[collection.name] = collection;
      get(collection.name + '_docs', docs => {
        if (!docs) return;
        docs = JSON.parse(docs);

        for (let i = 0; i < docs.length; i++) {
          _add_doc(collection.name, get_doc(collection.name, docs[i]));
        }
      });
    },
    get_docs: (type, doc) => {
      return _data[type].all;
    },
    get_doc: (type, _id) => {
      if (!_data[type].by_id[_id]) {
        _data[type].by_id[_id] = {};
        _data[type].by_id[_id][undefined._id] = _id;
        get(type + '_' + _id, doc => {
          if (!doc) return;

          for (let each in doc) {
            _data[type].by_id[_id][each] = doc[each];
          }
        });
      }

      return _data[type].by_id[_id];
    },
    replace: (doc, each, exe) => {
      doc[each] = exe(doc, value => {
        doc[each] = value;
      });
    },
    set_doc: (type, doc) => {
      if (!_data[type].by_id[doc[_id]]) {
        _data[type].by_id[doc[_id]] = {};
      }

      if (typeof _data[type].opts.replace == 'function') {
        doc = _data[type].opts.replace(doc);
      } else if (typeof _data[type].opts.replace == 'object') {
        for (let each in _data[type].opts.replace) {
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

    remove_doc(type, _id) {
      remove(type + '_' + _id);
      delete data[type].by_id[_id];
      store_docs(type);
    },

    sortAscId: (id = '_id') => {
      return function (a, b) {
        if (a[id] > b[id]) return 1;else return -1;
      };
    },
    sortDescId: (id = '_id') => {
      return function (a, b) {
        if (a[id] < b[id]) return 1;else return -1;
      };
    },
    sortAscString: opts => {
      if (typeof opts == 'string') {
        opts = {
          field: opts
        };
      }

      return function (a, b) {
        if (a[opts.field].toLowerCase() > b[opts.field].toLowerCase()) return 1;else if (a[opts.field].toLowerCase() < b[opts.field].toLowerCase() || !opts.next) return -1;else return opts.next(a, b);
      };
    },
    sortDescString: opts => {
      if (typeof opts == 'string') {
        opts = {
          field: opts
        };
      }

      return function (a, b) {
        if (a[opts.field].toLowerCase() < b[opts.field].toLowerCase()) return 1;else if (a[opts.field].toLowerCase() > b[opts.field].toLowerCase() || !opts.next) return -1;else return opts.next(a, b);
      };
    },
    sortAscDate: opts => {
      if (typeof opts == 'string') {
        opts = {
          field: opts
        };
      }

      return function (a, b) {
        if (a[opts.field].getTime() > b[opts.field].getTime()) return 1;else if (a[opts.field].getTime() < b[opts.field].getTime() || !opts.next) return -1;else return opts.next(a, b);
      };
    },
    sortDescDate: opts => {
      if (typeof opts == 'string') {
        opts = {
          field: opts
        };
      }

      return function (a, b) {
        if (a[opts.field].getTime() < b[opts.field].getTime()) return 1;else if (a[opts.field].getTime() > b[opts.field].getTime() || !opts.next) return -1;else return opts.next(a, b);
      };
    },
    sortAscNumber: opts => {
      if (typeof opts == 'string') {
        opts = {
          field: opts
        };
      }

      return function (a, b) {
        if (a[opts.field] > b[opts.field]) return 1;else if (a[opts.field] < b[opts.field] || !opts.next) return -1;else return opts.next(a, b);
      };
    },
    sortDescNumber: opts => {
      if (typeof opts == 'string') {
        opts = {
          field: opts
        };
      }

      return function (a, b) {
        if (a[opts.field] < b[opts.field]) return 1;else if (a[opts.field] > b[opts.field] || !opts.next) return -1;else return opts.next(a, b);
      };
    },
    sortAscBoolean: opts => {
      if (typeof opts == 'string') {
        opts = {
          field: opts
        };
      }

      return function (a, b) {
        if (!a[opts.field] && b[opts.field]) return 1;else if (a[opts.field] && !b[opts.field] || !opts.next) return -1;else return opts.next(a, b);
      };
    },
    sortDescBoolean: opts => {
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

const HttpService = () => {
  return /*#__PURE__*/React.createElement(HTTP, null);
};
const RenderService = () => {
  return /*#__PURE__*/React.createElement(Render, null);
};
const HashService = () => {
  return /*#__PURE__*/React.createElement(Hash_Service, null);
};
const CoreService = () => {
  return /*#__PURE__*/React.createElement(Core_Service, null);
};
const StoreService = () => {
  return /*#__PURE__*/React.createElement(Store_Service, null);
};

export { CoreService, HashService, HttpService, RenderService, StoreService };
//# sourceMappingURL=index.modern.js.map
