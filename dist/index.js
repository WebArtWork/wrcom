function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = _interopDefault(require('react'));

var User = function User() {
  var us = {
    is: {},
    data: {},
    users: [],
    update: function update() {
      window.http.post('/api/user/update', {
        name: us.name,
        data: us.data
      }, function (resp) {});
    },
    change_password: function change_password(oldPass, newPass) {
      window.http.post('/api/user/changePassword', {
        newPass: newPass,
        oldPass: oldPass
      }, function (resp) {
        if (resp) alert('successfully changed password');else alert('failed to change password');
      });
    },
    logout: function logout() {
      window.http.get('/api/user/logout');
      localStorage.removeItem('waw_user');
      window.render.call('logout');
    },
    create: function create(user) {
      window.http.post('/api/user/create', {
        email: user
      }, function (resp) {});
    },
    save: function save(user) {},
    "delete": function _delete(id) {
      for (var i = us.users.length - 1; i >= 0; i--) {
        if (us.users[i]._id == id) {
          us.users.splice(i, 1);
        }
      }

      window.http.post('/api/user/deleteadmin', {
        _id: id
      }, function (resp) {
        window.render.call('user list');
      });
    },
    set: function set(user) {
      for (var each in user) {
        us[each] = user[each];
      }
    }
  };
  window.us = us;

  if (localStorage.getItem("waw_user")) {
    us.set(JSON.parse(localStorage.getItem("waw_user")));
    window.http.get('/api/user/me', us.set);
  }

  window.http.get('/api/user/get', function (users) {
    us.users = users;
    us._users = {};

    for (var i = users.length - 1; i >= 0; i--) {
      us._users[users[i]._id] = users[i];
    }

    window.render.call('user list');
  });
  return null;
};

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

var UserList = function UserList() {
  return /*#__PURE__*/React.createElement(User, null);
};
var ExampleComponent = function ExampleComponent() {
  return /*#__PURE__*/React.createElement(HTTP, null);
};

exports.ExampleComponent = ExampleComponent;
exports.UserList = UserList;
//# sourceMappingURL=index.js.map
