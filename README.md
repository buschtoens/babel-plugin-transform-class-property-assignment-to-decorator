# babel-plugin-transform-class-property-assignment-to-decorator

Transforms a class property assignment to a decorated class property.

```js
import { task } from 'ember-concurrency';

class Foo {
  simpleTask = task(function*() {}).restartable();
}

// becomes

class Foo {
  @(task(function*() {}).restartable())
  simpleTask;
}
```

## Options

Accepts a configuration object with an `imports` property, that can look like
this:

```js
{
  imports: {
    'ember-concurrency': ['task', 'taskGroup']
  }
}
```

This configuration will transform all usages of the `task` and `taskGroup`
exports from the `ember-concurrency` modules.
