'use strict';

const mysql = require('mysql');
const DI = require('@scola/di');
const Database = require('./lib/database.js');

class Module extends DI.Module {
  configure() {
    this.inject(Database).with(
      this.value(mysql)
    );
  }
}

module.exports = {
  Database,
  Module
};
