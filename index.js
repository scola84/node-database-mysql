'use strict';

const mysql = require('mysql');

const DI = require('@scola/di');
const Chain = require('@scola/chain');

const Database = require('./lib/database.js');

class Module extends DI.Module {
  configure() {
    this.inject(Database).with(
      this.object({}),
      this.instance(Chain),
      this.value(mysql)
    );
  }
}

module.exports = {
  Database,
  Module
};
