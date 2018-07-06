CREATE DATABASE chat;

USE chat;

CREATE TABLE messages (
  id INTEGER PRIMARY KEY,
  user INTEGER,
  room INTEGER,
  created_at TIMESTAMP,
  FOREIGN KEY(user) REFERENCES users(id),
  FOREIGN KEY(room) REFERENCES rooms(id)
);

CREATE TABLE users (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

CREATE TABLE rooms (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);

/*  Execute this file from the command line by typing:
 *    mysql -u root < server/schema.sql
 *  to create the database and the tables.*/

