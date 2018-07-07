var models = require('../models');

module.exports = {
  messages: {
    get: function (req, res) {
      models.messages.get((results) => {
        res.send({ results: results });
      });
    },
    post: function (req, res) {
      var message = req.body;
      models.messages.post(message, (results) =>
        res.send(results)
      );
    } 
  },

  users: {
    get: function (req, res) {
      models.users.get((results) => 
        res.send(results)
      );
    },
    post: function (req, res) {
      var user = req.body;
      models.users.post(user, (results) =>
        res.send(results)
      );
    } 
  }
};

