import { task } from 'ember-concurrency';

class Foo {
  simpleTask = task(function*() {})
    .restartable()
    .maxConcurrency(3);
}
