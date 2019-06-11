import { join } from 'path';
// @ts-ignore
import pluginTester from 'babel-plugin-tester';
import transformClassPropertyAssignmentToDecorator from './';

pluginTester({
  plugin: transformClassPropertyAssignmentToDecorator,
  fixtures: join(__dirname, '__fixtures__'),
  babelOptions: {
    plugins: ['@babel/plugin-syntax-class-properties']
  }
});
