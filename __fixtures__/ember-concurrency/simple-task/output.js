"use strict";

var _emberConcurrency = require("ember-concurrency");

class Foo {
  simpleTask = (0, _emberConcurrency.task)(function* () {});
}