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
  const replaces = [{
    from: '%20',
    to: ' '
  }];
  hash = {};
  let done = false;
  window.hash = {
    on: (field, cb = resp => {}) => {
      if (!done) return setTimeout(() => {
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
    done = true;
    return null;
  }

  let hash = window.location.hash.replace('#!#', '').replace('#', '').split('&');

  for (let i = 0; i < hash.length; i++) {
    let holder = hash[i].split('=')[0];
    let value = hash[i].split('=')[1];

    for (let j = 0; j < replaces.length; j++) {
      holder = holder.split(replaces[j].from).join(replaces[j].to);
      value = value.split(replaces[j].from).join(replaces[j].to);
    }

    hash[holder] = value;
  }

  done = true;
  return null;
};

const Core_Service = () => {
  let host = window.location.host.toLowerCase();
  let _afterWhile = {};
  let cb = {};
  let _ids = {};
  let done_next = {};
  window.core = {
    serial_process: (i, arr, callback) => {
      if (i >= arr.length) return callback();
      arr[i](() => {
        serial_process(++i, arr, callback);
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
      serial_process(0, arr, callback);
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

          serial_process(0, serialArr, callback);
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

          serial_process(0, serialArr, callback);
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
    afterWhile: (doc, cb, time = 1000) => {
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
    emit: (signal, doc = {}) => {
      if (!cb[signal]) cb[signal] = {};

      for (let each in cb[signal]) {
        if (typeof cb[signal][each] == 'function') {
          cb[signal][each](doc);
        }
      }
    },
    on: (signal, cb) => {
      let id = Math.floor(Math.random() * Date.now()) + 1;
      if (_ids[id]) return on(signal, cb);
      _ids[id] = true;
      if (!cb[signal]) cb[signal] = {};
      cb[signal][id] = cb;
      return () => {
        cb[signal][id] = null;
      };
    },
    done: signal => {
      done_next[signal] = true;
    },
    ready: signal => {
      return done_next[signal];
    },
    next: (signal, cb) => {
      if (done_next[signal]) cb();else {
        return setTimeout(() => {
          next(signal, cb);
        }, 100);
      }
    }
  };
  var userAgent = navigator.userAgent || navigator.vendor || window.opera;

  if (/windows phone/i.test(userAgent)) ; else if (/android/i.test(userAgent)) ; else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) ;

  core.set_version();
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

export { CoreService, HashService, HttpService, RenderService };
//# sourceMappingURL=index.modern.js.map
