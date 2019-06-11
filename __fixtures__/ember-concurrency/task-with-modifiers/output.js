"use strict";

var _emberConcurrency = require("ember-concurrency");

class Foo {
  @(0, _emberConcurrency.task)(function* () {}).restartable().maxConcurrency(3)
  simpleTask;
}