'use strict';

const EventHandler = require('@scola/events');

class Database extends EventHandler {
  constructor(mysql) {
    super();
    this.mysql = mysql;
  }

  connect(options) {
    return new Promise((resolve, reject) => {
      this.connection = this.mysql.createConnection(options);
      this.connection.connect((error) => {
        if (error) {
          return reject(this.handleError(error));
        }

        resolve(this);
      });
    });
  }

  read(query, request) {
    return this.execute(query, request, this.handleRead);
  }

  write(query, request) {
    return this.execute(query, request, this.handleWrite);
  }

  execute(query, request, handler) {
    return new Promise((resolve, reject) => {
      query(
        this.connection,
        request,
        handler.bind(this, resolve, reject, request)
      );
    });
  }

  handleRead(resolve, reject, request, error, result) {
    if (error) {
      return reject(error);
    }

    if (request.id && result) {
      return resolve(result[0]);
    }

    resolve(result);
  }

  handleWrite(resolve, reject, request, error, result) {
    if (error) {
      return reject(error);
    }

    if (result.insertId) {
      request.values.id = result.insertId;
    }

    resolve(request.values);
  }

  handleError(error) {
    this.emit('error', {
      error
    });

    return new Error('@scola.model.database');
  }
}

module.exports = Database;
