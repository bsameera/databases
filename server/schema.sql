CREATE DATABASE chat;

USE chat;

CREATE TABLE users (
  id INTEGER NOT NULL AUTO_INCREMENT,
  name VARCHAR(16),
  PRIMARY KEY (id)
);

CREATE TABLE messages (
  id INTEGER NOT NULL AUTO_INCREMENT,
  user_id INTEGER,
  room_name VARCHAR(16),
  content TEXT,
  created_at TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id),
  PRIMARY KEY(id)
);

/*  Execute this file from the command line by typing:
 *    mysql -u root < server/schema.sql
 *  to create the database and the tables.*/

