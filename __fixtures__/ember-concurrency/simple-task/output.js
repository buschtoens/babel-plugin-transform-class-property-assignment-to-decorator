"use strict";

var _emberConcurrency = require("ember-concurrency");

class Foo {
  @(0, _emberConcurrency.task)(function* () {})
  simpleTask;
}