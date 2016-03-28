'use strict';

const Deep = require('@scola/deep');
const EventHandler = require('@scola/events');

class Database extends EventHandler {
  constructor(queries, queryChain, mysql) {
    super();

    this.queries = queries;
    this.queryChain = queryChain;
    this.mysql = mysql;
  }

  connect(options) {
    options = Deep.assign({
      queryFormat: this.queryFormat
    }, options);

    this.pool = this.mysql.createPool(options);
  }

  read(query, ...parameters) {
    return this.execute(query, this.handleRead, parameters);
  }

  readAll(query, ...parameters) {
    return this.execute(query, this.handleReadAll, parameters);
  }

  readSerial(...queries) {
    return this.queryChain.serial(queries, (query, ...parameters) => {
      parameters = parameters.slice();

      if (query.parameters) {
        parameters.unshift(query.parameters);
      }

      if (query.queryAll) {
        return this.readAll(query.queryAll, ...parameters);
      }

      return this.read(query.query, ...parameters);
    });
  }

  readParallel(...queries) {
    return this.queryChain.parallel(queries, (query) => {
      if (query.queryAll) {
        return this.readAll(query.queryAll, query.parameters);
      }

      return this.read(query.query, query.parameters);
    });
  }

  write(query, ...parameters) {
    return this.execute(query, this.handleWrite, parameters);
  }

  writeSerial(...queries) {
    return this.queryChain.serial(queries, (query, ...parameters) => {
      parameters = parameters.slice();

      if (query.parameters) {
        parameters.unshift(query.parameters);
      }

      return this.write(query.query, ...parameters);
    });
  }

  writeParallel(...queries) {
    return this.queryChain.parallel(queries, (query) => {
      return this.write(query.query, query.parameters);
    });
  }

  execute(query, handler, parameters) {
    return new Promise((resolve, reject) => {
      this.pool.getConnection((error, connection) => {
        if (error) {
          return reject(error);
        }

        if (!this.queries[query]) {
          return reject(new Error(500));
        }

        return this.queries[query](
          connection,
          handler.bind(this, connection, resolve, reject),
          ...parameters
        );
      });
    });
  }

  handleRead(connection, resolve, reject, error, result) {
    connection.release();

    if (error) {
      return reject(error);
    }

    return resolve(result[0]);
  }

  handleReadAll(connection, resolve, reject, error, result) {
    connection.release();

    if (error) {
      return reject(error);
    }

    return resolve(result);
  }

  handleWrite(connection, resolve, reject, error, result) {
    connection.release();

    if (error) {
      return reject(error);
    }

    return resolve(result);
  }

  queryFormat(query, parameters) {
    if (!parameters) {
      return query;
    }

    return query.replace(/\:(\w+)/g, (text, key) => {
      if (parameters.hasOwnProperty(key)) {
        return this.escape(parameters[key]);
      }

      return text;
    });
  }
}

module.exports = Database;
