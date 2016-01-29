'use strict';

const mysql = require('mysql');
const DI = require('@scola/di');
const Database = require('./lib/database.js');

class Module extends DI.Module {
  configure() {
    this.inject(Database)
      .insertArgument(1, this.value(mysql));
  }
}

module.exports = {
  Database,
  Module
};
