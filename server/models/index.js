var db = require('../db');

var dbQuery = function(queryString, callback) {
  db.connect();  
  db.query(queryString, null, (err, results) => {
    debugger;
    if (err) {
      callback(err);
    } else {
      db.end();
      callback(results);
    }
  });
}; 

module.exports = {
  messages: {
    get: function (callback) {
      var queryString = 'SELECT * FROM messages';
      dbQuery(queryString, callback);
    },
    post: function (message, callback) {
      var queryString = `INSERT INTO messages (user, room, content)
      VALUES ('${message.username}', '${message.roomname}', '${message.content}')`;
      dbQuery(queryString, callback);
    } 
  },

  users: {
    get: function (callback) {
      var queryString = 'SELECT * FROM users';
      dbQuery(queryString, callback);
    },
    post: function (user, callback) {
      var queryString = `INSERT INTO users (name) VALUES ('${user.username}')`;
      dbQuery(queryString, callback);
    }
  }
};


