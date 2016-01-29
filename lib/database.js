'use strict';

const EventHandler = require('@scola/events');

class Database extends EventHandler {
  constructor(queries, mysql) {
    super();

    this.queries = queries;
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

  read(name, data) {
    return this.query(name, data, this.handleRead);
  }

  write(name, data) {
    return this.query(name, data, this.handleWrite);
  }

  query(name, data, handler) {
    return new Promise((resolve, reject) => {
      if (!this.queries[name]) {
        return reject(
          this.handleError(new Error('Query ' + name + ' does not exist'))
        );
      }

      this.queries[name](
        this.connection,
        data,
        handler.bind(this, resolve, reject, data)
      );
    });
  }

  handleRead(resolve, reject, data, error, result) {
    if (error) {
      return reject(error);
    }

    if (data.id && result) {
      return resolve(result[0]);
    }

    resolve(result);
  }

  handleWrite(resolve, reject, data, error, result) {
    if (error) {
      return reject(error);
    }

    if (result.insertId) {
      data.values.id = result.insertId;
    }

    resolve(data.values);
  }

  handleError(error) {
    this.emit('error', {
      error
    });

    return new Error('@scola.model.database');
  }
}

module.exports = Database;
