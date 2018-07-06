let app = {};

app.server = 'http://parse.sfm8.hackreactor.com/chatterbox/classes/messages';
app.defaultRoom = 'View all';

app.init = function() {
  this.messages = [];
  this.nextMessageIndex = 0;
  this.rooms = {};
  this.friends = {};
  this.username = window.location.search.split('=')[1];

  this.$messages = $('#chats');
  this.$input = $('#message');
  this.$allRooms = $('#allRooms');
  this.$activeRooms = $('#activeRooms');
  this.$inactiveRooms = $('#inactiveRooms');
  this.$friendsList = $('#friendsList');

  $('#send').on('submit', this.handleSubmit.bind(this));
  $('#rooms').on('click', '.roomname', this.changeRoom.bind(this));
  $('#main').on('click', '.username', this.handleUsernameClick.bind(this));
  $('#username').html(`You are ${this.username}.`);

  this.fetch();
  setInterval(this.fetch.bind(this), 2000);
};


/**** Fetching messages and manipulating them on DOM ****/

app.fetch = function() {
  let self = this;
  $.ajax({
    url: self.server,
    data: 'order=-createdAt',
    type: 'GET',
    contentType: 'application/json',
    dataFilter: self.filterNewMessages.bind(self),
    success: function (data) {
      self.updateMessages(data);
      self.updateRooms(data);
      self.renderMessages();
      self.renderRooms();
      console.log('chatterbox: Messages fetched');
    },
    error: function (data) {
      console.error('chatterbox: Failed to fetch message', data);
    }
  });
};

app.filterNewMessages = function(retData, json) {
  let self = this;
  let data = JSON.parse(retData);
  let newMessages = _.filter(data.results, function(result) {
    return !self.messages.length || result.createdAt > self.messages[self.messages.length - 1].createdAt;
  });
  return JSON.stringify(newMessages.reverse());
},

app.updateMessages = function(newMessages) {
  for (let i = 0; i < newMessages.length; i++) {
    let message = newMessages[i];
    this.messages.push(message);
  }
};

app.renderMessages = function() {
  for (let i = this.nextMessageIndex; i < this.messages.length; i++) {
    if (!this.currentRoom || this.messages[i].roomname === this.currentRoom) {
      this.renderMessage(this.messages[i]);
    }
  }
  this.nextMessageIndex = this.messages.length;
};

app.renderMessage = function(message) {
  message.$node = this.makeMessageNode(message);
  message.$node.prependTo(this.$messages);
  setTimeout(function() {
    message.$node.addClass('show');
  }, 100);
};

app.clearMessages = function() {
  this.$messages.empty();
  this.nextMessageIndex = 0;
};

app.makeMessageNode = function(message) {
  let friend = this.friends[message.username] ? 'friend' : '';
  let username = this.escape(message.username);
  let text = this.escape(message.text);
  return $(`<div class="chat ${username === this.username ? 'sent' : ''} ">
    <div class="username" value="${username}">${username}</div> 
    <div class="text ${friend}">${text}</div>
    <div class="timestamp">${$.timeago(message.createdAt)}</div>
  </div>`);
};


/**** Managing chat rooms ****/

app.updateRooms = function(newMessages) {
  for (let i = 0; i < newMessages.length; i++) {
    var roomname = newMessages[i].roomname;
    if (roomname && roomname !== this.defaultRoom) {
      this.rooms[roomname] = this.rooms[roomname] || { count: 0 };
      this.rooms[roomname].count++;
    }
  }
};

app.renderRooms = function() {
  for (let room in this.rooms) {
    this.renderRoom(room);
  }
};

app.renderRoom = function(roomname) {
  let countText = this.rooms[roomname].count ? `(${this.rooms[roomname].count})` : '';
  this.rooms[roomname].$node = this.rooms[roomname].$node || this.makeRoomNode(roomname);
  this.rooms[roomname].$node.html(`${roomname} ${countText}`);
  if (this.rooms[roomname].count) {
    this.activateRoom(roomname);
  } else {
    this.deactivateRoom(roomname);
  }
};

app.changeRoom = function(event) {
  let selected = event.target.getAttribute('value');
  if (selected === 'newRoom') {
    let roomname = prompt('Type in a room name:').trim() || this.defaultRoom;
    this.renderRoom(roomname);
    this.setRoom(roomname);
  } else {
    this.setRoom(selected);
  }
};

app.setRoom = function(roomname) {
  if (roomname !== this.currentRoom) {
    if (this.currentRoom) {
      this.rooms[this.currentRoom].count = 0;
      this.rooms[this.currentRoom].$node.toggleClass('selected');
    } 
    if (roomname) {
      this.rooms[roomname].$node.toggleClass('selected');
    } 
    if (!roomname || !this.currentRoom) {
      this.$allRooms.toggleClass('selected');
    }
  } 
  this.currentRoom = roomname;
  this.clearMessages();
  this.fetch();
  this.$input.focus();
};

app.activateRoom = function(roomname) {
  if (!this.rooms[roomname].$node.hasClass('active')) {
    this.rooms[roomname].$node.addClass('active');  
    this.moveRoom(this.rooms[roomname].$node, this.$activeRooms, this.$inactiveRooms);
  }
};

app.deactivateRoom = function(roomname) {
  if (this.rooms[roomname].$node.hasClass('active')) {
    this.rooms[roomname].$node.removeClass('active');  
    this.moveRoom(this.rooms[roomname].$node, this.$inactiveRooms, this.$activeRooms);
  }
};

app.moveRoom = function($roomNode, $destination, $source) {
  $roomNode.remove();
  $roomNode.prependTo($destination);
  $destination.parent().show();
  this.hideRoomTypeIfNecessary($source);
};

app.hideRoomTypeIfNecessary = function(roomType) {
  if (roomType.children().length === 0) {
    roomType.parent().hide();
  }
};

app.makeRoomNode = function(roomname) {
  return $(`<div class="roomname" value="${roomname}">`);
};


/**** Adding/removing friends ****/

app.handleUsernameClick = function(event) {
  let username = event.target.innerText;
  if (!this.friends[username]) {
    this.addFriend(username);
  } else {
    this.removeFriend(username);
  }
  this.messages.forEach(function(message) {
    if (message.username === username) {
      message.$node.find('.text').toggleClass('friendMessage');
    }
  });
};

app.addFriend = function(friendName) {
  this.friends[friendName] = {$node: this.makeFriendNode(friendName)};
  this.friends[friendName].$node.appendTo(this.$friendsList);
  this.$friendsList.parent().show();
};

app.removeFriend = function(friendName) {
  this.friends[friendName].$node.remove();
  delete this.friends[friendName];
  if (this.$friendsList.children().length === 0) {
    this.$friendsList.parent().hide();
  }
};

app.makeFriendNode = function(friendName) {
  return $(`<div class="friend" value="${friendName}">${friendName}</div>`);
};


/**** Sending/submitting messages ****/

app.send = function(message) {
  let self = this;
  $.ajax({
    url: this.server,
    type: 'POST',
    data: JSON.stringify(message),
    contentType: 'application/json',
    success: function (data) {
      self.fetch();
      self.$input.focus();
      console.log('chatterbox: Message sent');
    },
    error: function (data) {
      console.error('chatterbox: Failed to send message', data);
    }
  });
};

app.handleSubmit = function() {
  let message = {
    username: this.username,
    text: this.$input.val(),
    roomname: this.currentRoom
  };
  if (message.text !== '') {
    this.send(message);
    this.$input.val('');
  }
  return false;
};


/**** Cleaning text for HTML rendering ****/

app.escape = function(str) {
  if (str) {
    let escapeChars = [/\&/g, /\</g, /\>/g, /\"/g, /\//g];
    let replaceChars = ['&amp', '&lt', '&gt', '&quot', '&#x2F'];
    for (let i = 0; i < escapeChars.length; i++) {
      str = str.replace(escapeChars[i], replaceChars[i]);
    }
    return str;
  }
};


/**** Run app ****/

$(document).ready(function() {
  app.init();
});
