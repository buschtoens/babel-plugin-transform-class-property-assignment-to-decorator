import { taskGroup } from 'ember-concurrency';

class Foo {
  simpleTaskGroup = taskGroup();
}
