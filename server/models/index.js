var db = require('../db');

var dbQuery = function(queryString, callback) {
  db.query(queryString, null, (err, results) => {
    if (err) {
      callback(err);
    } else {
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
      var userQuery = `SELECT id FROM users WHERE users.name = "${message.username}"`;
      dbQuery(userQuery, (results) => {
        var messageQuery = `INSERT INTO messages (user_id, room_name, content) 
          VALUES (${results[0].id}, "${message.roomname}", "${message.content}")`;
        dbQuery(messageQuery, callback); 
      });
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


