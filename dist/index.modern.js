import 'react';

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
      }).then(callback).then(resp => {
        console.log('Created Type is sent successfully');
      }).catch(err => {
        console.log('Type send failed', err);
      });
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

function Hash_Service() {
  const _replaces = [{
    from: '%20',
    to: ' '
  }];
  let hash = window.location.hash.replace('#!#', '').replace('#', '').split('&');

  for (let i = hash.length - 1; i >= 0; i--) {
    if (!hash[i]) {
      hash.splice(i, 1);
      continue;
    }

    let holder = hash[i].split('=')[0];
    let value = hash[i].split('=')[1];

    for (let j = 0; j < _replaces.length; j++) {
      holder = holder.split(_replaces[j].from).join(_replaces[j].to);
      value = value.split(_replaces[j].from).join(_replaces[j].to);
    }

    hash[holder] = value;
  }

  window.hash = {
    save: () => {
      let new_hash = '';

      for (const each in hash) {
        if (new_hash) {
          new_hash += '&';
        }
        new_hash = each + '=' + hash[each];
      }

      if (history.pushState) {
        history.pushState(null, null, '#' + new_hash);
      } else {
        location.hash = '#' + new_hash;
      }
    },
    set: (field, value) => {
      hash[field] = value;
      window.hash.save();
    },
    get: field => {
      return hash[field];
    },
    clear: field => {
      delete hash[field];
      window.hash.save();
    }
  };
  return null;
}

const Core_Service = router => {
  let host = window.location.host.toLowerCase();
  let _afterWhile = {};
  let _cb = {};
  let _ids = {};
  let _done_next = {};
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/windows phone/i.test(userAgent)) ; else if (/android/i.test(userAgent)) ; else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) ;

  window.core = {
    afterWhile: (doc, _cb, time = 1000) => {
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
    _serial_process: (i, arr, callback) => {
      if (i >= arr.length) return callback();
      arr[i](() => {
        _serial_process(++i, arr, callback);
      });
    },
    set_version: (version = '1.0.0') => {
      version = version;
      document.addEventListener('deviceready', () => {
        window.core.done('mobile');

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
      window.core._serial_process(0, arr, callback);
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

          window.core._serial_process(0, serialArr, callback);
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

          window.core._serial_process(0, serialArr, callback);
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
  window.core.set_version();
  return null;
};

function Store_Service(config) {
  let _db = null;
  let _data = {};
  let _id = '_id';
  if (!config.database) config.database = {};
  if (config.database._id) _id = config.database._id;
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

  const sort = function (arr, sort) {
    if (!Array.isArray(arr)) return;
    if (typeof sort == 'string' && typeof window.store[sort] == 'function') arr.sort(window.store[sort]);else if (typeof sort == 'function') arr.sort(sort);
  };

  window.store = {
    set: (hold, value, cb = () => {}, errCb = () => {}) => {
      if (window.sqlitePlugin) {
        if (!_db) {
          return setTimeout(() => {
            window.store.set(hold, value, cb);
          }, 100);
        }

        window.store.get(hold, resp => {
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
            window.store.get(hold, cb);
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
          window.store.remove(hold);
        }, 100);

        _db.executeSql('DELETE FROM Data where hold=?', [hold], cb, errcb);
      } else {
        window.localStorage.removeItem('waw_temp_storage_' + hold);
        cb();
      }
    },
    clear: (cb = () => {}, errcb = () => {}) => {
      window.localStorage.clear();

      if (window.sqlitePlugin) {
        if (!db) {
          return setTimeout(() => {
            window.store.clear();
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
        if (each) docs.push(each);
      }

      window.store.set(type + '_docs', JSON.stringify(docs));
    },
    add_doc: (type, doc) => {
      if (!_data[type].by_id[doc[_id]]) {
        _data[type].by_id[doc[_id]] = doc;
      } else {
        for (let each in doc) {
          _data[type].by_id[doc[_id]][each] = doc[each];
        }
      }

      let add = true;

      _data[type].all.forEach(selected => {
        if (selected[_id] == doc[_id]) add = false;
      });

      if (add) _data[type].all.push(_data[type].by_id[doc[_id]]);
      if (_data[type].sort) sort(_data[type].all, _data[type].sort);

      if (_data[type].opts.query) {
        for (let key in _data[type].opts.query) {
          let query = _data[type].opts.query[key];
          if (typeof query.ignore == 'function' && query.ignore(doc)) continue;
          if (typeof query.allow == 'function' && !query.allow(doc)) continue;

          if (!_data[type].query[key]) {
            _data[type].query[key] = [];
          }

          add = true;

          _data[type].query[key].forEach(selected => {
            if (selected[_id] == doc[_id]) add = false;
          });

          if (add) _data[type].query[key].push(_data[type].by_id[doc[_id]]);
          if (query.sort) sort(_data[type].query[key], query.sort);
        }
      }

      if (_data[type].opts.groups) {
        for (let key in _data[type].opts.groups) {
          let groups = _data[type].opts.groups[key];
          if (typeof groups.ignore == 'function' && groups.ignore(doc)) continue;
          if (typeof groups.allow == 'function' && !groups.allow(doc)) continue;

          if (!_data[type].groups[key]) {
            _data[type].groups[key] = {};
          }

          let set = field => {
            if (!field) return;

            if (!Array.isArray(_data[type].groups[key][field])) {
              _data[type].groups[key][field] = [];
            }

            add = true;

            _data[type].groups[key][field].forEach(selected => {
              if (selected[_id] == doc[_id]) add = false;
            });

            if (add) _data[type].groups[key][field].push(_data[type].by_id[doc[_id]]);
            if (groups.sort) sort(_data[type].groups[key][field], groups.sort);
          };

          set(groups.field(doc, field => {
            set(field);
          }));
        }
      }
    },
    _initialize: collection => {
      if (!collection.all) collection.all = [];
      if (!collection.opts) collection.opts = {};
      if (!collection.by_id) collection.by_id = {};
      if (!collection.groups) collection.groups = {};
      if (!collection.query) collection.query = [];

      if (collection.query) {
        for (let key in collection.opts.query) {
          if (typeof collection.opts.query[key] == 'function') {
            collection.opts.query[key] = {
              allow: collection.opts.query[key]
            };
          }
        }
      }

      if (collection.groups) {
        if (typeof collection.opts.groups == 'string') {
          collection.groups = collection.groups.split(' ');
        }

        if (Array.isArray(collection.opts.groups)) {
          let arr = collection.opts.groups;
          collection.opts.groups = {};

          for (let i = 0; i < arr.length; i++) {
            if (typeof arr[i] == 'string') {
              collection.opts.groups[arr[i]] = true;
            } else {
              for (let key in arr[i]) {
                if (typeof arr[i][key] == 'function') {
                  arr[i][key] = {
                    field: arr[i][key]
                  };
                }

                collection.opts.groups[key] = arr[i][key];
              }
            }
          }
        }

        for (let key in collection.opts.groups) {
          if (typeof collection.opts.groups[key] == 'boolean' && typeof collection.opts.groups[key]) {
            collection.opts.groups[key] = {
              field: function (doc) {
                return doc[key];
              }
            };
          }

          if (typeof collection.opts.groups[key] == 'function' && typeof collection.opts.groups[key]) {
            collection.opts.groups[key] = {
              field: collection.opts.groups[key]
            };
          }

          if (typeof collection.opts.groups[key] != 'object' || typeof collection.opts.groups[key].field != 'function') {
            delete collection.opts.groups[key];
            continue;
          }

          collection.groups[key] = {};
        }
      }
      _data[collection.name] = collection;
      window.store.get(collection.name + '_docs', docs => {
        if (!docs) return;
        docs = JSON.parse(docs);

        for (let i = 0; i < docs.length; i++) {
          window.store.add_doc(collection.name, window.store.get_doc(collection.name, docs[i]));
        }
      });
    },
    all: (type, doc) => {
      return _data[type].all;
    },
    by_id: (type, doc) => {
      return _data[type].by_id;
    },
    query: (type, doc) => {
      return _data[type].query;
    },
    groups: (type, doc) => {
      return _data[type].groups;
    },
    get_doc: (type, _id) => {
      if (!_data[type].by_id[_id]) {
        _data[type].by_id[_id] = {};
        _data[type].by_id[_id][_id] = _id;
        window.store.get(type + '_' + _id, doc => {
          if (!doc) return;
          doc = JSON.parse(doc);

          for (let each in doc) {
            _data[type].by_id[_id][each] = doc[each];
          }
        });
      }

      return _data[type].by_id[_id];
    },
    _replace: (doc, each, exe) => {
      doc[each] = exe(doc, value => {
        doc[each] = value;
      });
    },
    set_doc: (type, doc) => {
      if (!_data[type].by_id[doc[_id]]) {
        _data[type].by_id[doc[_id]] = {};
      }

      if (typeof _data[type].opts._replace == 'function') {
        doc = _data[type].opts._replace(doc);
      } else if (typeof _data[type].opts._replace == 'object') {
        for (let each in _data[type].opts._replace) {
          if (typeof _data[type].opts._replace[each] == 'function') {
            window.store._replace(doc, each, _data[type].opts._replace[each]);
          }
        }
      }

      window.store.set(type + '_' + doc[_id], JSON.stringify(doc));
      window.store.add_doc(type, doc);

      window.store._set_docs(type);

      return _data[type].by_id[doc[_id]];
    },
    set_docs: (type, docs) => {
      for (let i = 0; i < docs.length; i++) {
        window.store.set_doc(type, docs[i]);
      }
    },

    remove_doc(type, _id) {
      window.store.remove(type + '_' + _id);
      delete _data[type].by_id[_id];
    },

    remove_docs: (type, docs) => {
      for (let i = 0; i < docs.length; i++) {
        window.store.remove_doc(type, docs[i]);
      }
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

  if (Array.isArray(config.database.collections)) {
    for (let i = 0; i < config.database.collections.length; i++) {
      window.store._initialize(config.database.collections[i]);
    }
  }
}

const Mongo_Service = () => {
  const _get = {};
  window.mongo = {
    create: (part, doc = undefined, cb = undefined, opts = {}) => {
      if (typeof doc == 'function') {
        if (cb) opts = cb;
        cb = doc;
        doc = {};
      }

      if (typeof opts == 'function') {
        opts = {
          err: opts
        };
      }

      if (typeof doc != 'object') doc = {};
      if (doc.___created && !opts.allow_multiple) return;
      doc.___created = true;
      window.http.post(opts.url || '/api/' + part + '/create', doc || {}, resp => {
        if (resp) {
          window.store.add_doc(part, doc);
          if (typeof cb == 'function') cb(resp);
        } else if (typeof cb == 'function') {
          cb(false);
        }
      }, opts);
    },
    fetch: (part, opts = undefined, cb = undefined) => {
      if (typeof opts == 'string') {
        opts = {
          query: {
            _id: opts
          }
        };
      }

      if (typeof opts == 'function') {
        cb = opts;
        opts = {};
      }

      if (opts._id) {
        opts.query = {
          _id: opts._id
        };
      }

      if (!opts) opts = {};
      if (!cb) cb = server_doc => {};
      let url = '/api/' + part + '/fetch' + (opts.name || '');
      let doc = {};

      if (opts._id) {
        doc = window.store.get_doc('user', opts._id);
      }

      window.http.post(opts.url || url, opts.query || {}, server_doc => {
        cb(server_doc);
        window.store.add_doc(part, server_doc);
        window.render.call();
      });
      return doc;
    },
    get: (part, opts = undefined, cb = undefined) => {
      if (typeof opts == 'function') {
        cb = opts;
        opts = {};
      }

      if (!opts) opts = {};
      let url = '/api/' + part + '/get' + (opts.name || '') + (opts.param || '');
      window.http.get(opts.url || url, resp => {
        window.store.remove_docs(part, resp);
        window.store.set_docs(part, resp);
        _get[part] = true;
      }, opts);
      return {
        all: window.store.all(part),
        by_id: window.store.by_id(part),
        query: window.store.query(part),
        groups: window.store.groups(part)
      };
    },
    _prepare_update: (part, doc, opts) => {
      window.store._add_doc(part, doc);

      if (opts.fields) {
        if (typeof opts.fields == 'string') opts.fields = opts.fields.split(' ');
        let _doc = {};

        for (let i = 0; i < opts.fields.length; i++) {
          _doc[opts.fields[i]] = doc[opts.fields[i]];
        }

        doc = _doc;
      }

      if (typeof opts.replace == 'object' && Object.values(opts.replace).length) {
        for (let key in opts.replace) {
          replace(doc, key, opts.replace[key]);
        }
      }

      if (typeof opts.rewrite == 'object' && Object.values(opts.rewrite).length) {
        doc = JSON.parse(JSON.stringify(doc));

        for (let key in opts.rewrite) {
          replace(doc, key, opts.rewrite[key]);
        }
      }

      return doc;
    },
    update: (part, doc, opts = undefined, cb = undefined) => {
      if (typeof opts == 'function') {
        cb = opts;
        opts = {};
      }

      if (typeof opts != 'object') opts = {};
      doc = window.mongo._prepare_update(part, doc, opts);
      let url = '/api/' + part + '/update' + (opts.name || '');
      window.http.post(opts.url || url, doc, resp => {
        if (resp) {
          window.store.add_doc(part, doc);
          window.render.call();
        }

        if (resp && typeof cb == 'function') {
          cb(resp);
        } else if (typeof cb == 'function') {
          cb(false);
        }
      }, opts);
    },
    unique: (part, doc, opts = undefined, cb = undefined) => {
      if (typeof opts == 'function') {
        cb = opts;
        opts = {};
      }

      if (typeof opts != 'object') opts = {};
      doc = window.mongo._prepare_update(part, doc, opts);
      console.log(doc);
      let url = '/api/' + part + '/unique' + (opts.name || '');
      window.http.post(opts.url || url, doc, resp => {
        if (resp) {
          window.store.add_doc(part, doc);
          window.render.call();
        }

        if (resp && typeof cb == 'function') {
          cb(resp);
        } else if (typeof cb == 'function') {
          cb(false);
        }
      }, opts);
    },
    delete: (part, doc, opts = undefined, cb = undefined) => {
      if (typeof opts == 'function') {
        cb = opts;
        opts = {};
      }

      if (typeof opts !== 'object') opts = {};

      if (opts.fields) {
        if (typeof opts.fields == 'string') opts.fields = opts.fields.split(' ');
        let _doc = {};

        for (let i = 0; i < opts.fields.length; i++) {
          _doc[opts.fields[i]] = doc[opts.fields[i]];
        }

        doc = _doc;
      } else {
        doc = {
          _id: doc._id
        };
      }

      let url = '/api/' + part + '/delete' + (opts.name || '');
      window.http.post(opts.url || url, doc, resp => {
        if (resp) {
          window.store.remove_docs(part, doc);
        }

        if (resp && typeof cb == 'function') {
          cb(resp);
        } else if (typeof cb == 'function') {
          cb(false);
        }
      }, opts);
    },
    _id: cb => {
      if (typeof cb == 'function') {
        window.http.get('/waw/newId', cb);
      }
    },
    on: (parts, cb) => {
      if (typeof parts == 'string') {
        parts = parts.split(" ");
      }

      for (let i = 0; i < parts.length; i++) {
        if (!_get[parts[i]]) {
          return setTimeout(() => {
            window.mongo.on(parts, cb);
          }, 100);
        }
      }

      cb();
    }
  };
};

const HttpService = () => {
  return HTTP();
};
const RenderService = () => {
  return Render();
};
const HashService = () => {
  return Hash_Service();
};
const CoreService = router => {
  return Core_Service();
};
const StoreService = config => {
  return Store_Service(config);
};
const MongoService = () => {
  return Mongo_Service();
};

export { CoreService, HashService, HttpService, MongoService, RenderService, StoreService };
//# sourceMappingURL=index.modern.js.map
