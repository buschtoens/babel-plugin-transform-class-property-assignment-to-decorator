import babel, { PluginObj, NodePath, types } from '@babel/core';

interface State {
  opts: {
    imports: Imports;
  };
}

interface Imports {
  [moduleName: string]: string[];
}

export default function transformClassPropertyAssignmentToDecorator({
  types: t
}: typeof babel): PluginObj<State> {
  return {
    name: require('./package').name as string,
    visitor: {
      // Logic loosely based on https://github.com/ember-cli/babel-plugin-ember-modules-api-polyfill
      ImportDeclaration(path, state) {
        const { imports } = state.opts;

        const node = path.node;
        const importModuleName = node.source.value;
        const specifiers = path.get('specifiers');

        // This is all the imports to watch out for.
        const exportsToTransforms = imports[importModuleName];

        // Only walk specifiers if this is a module we need to watch out for.
        if (exportsToTransforms) {
          // Filter all the specifiers whose usages we need to transform.
          const importsToTransform = specifiers.filter(specifierPath => {
            const specifier = specifierPath.node;

            // We only care about these 2 specifiers.
            if (
              specifier.type !== 'ImportDefaultSpecifier' &&
              specifier.type !== 'ImportSpecifier'
            ) {
              if (specifier.type === 'ImportNamespaceSpecifier') {
                throw new Error(
                  `Using \`import * as ${
                    specifier.local
                  } from '${importModuleName}'\` is not supported.`
                );
              }
              return false;
            }

            // Determine the import name: either `default` or named.
            const importName =
              specifier.type === 'ImportDefaultSpecifier'
                ? 'default'
                : specifier.imported.name;

            // Skip, if export is not listed.
            return exportsToTransforms.includes(importName);
          }) as NodePath<
            types.ImportDefaultSpecifier | types.ImportSpecifier
          >[];

          if (importsToTransform.length === 0) return;

          for (const importSpecifier of importsToTransform) {
            for (const referencePath of path.scope.bindings[
              importSpecifier.node.local.name
            ].referencePaths) {
              const classPropertyPath = referencePath.findParent(
                path => !path.isExpression()
              );
              if (!classPropertyPath.isClassProperty())
                throw referencePath.buildCodeFrameError(
                  `\`${
                    importSpecifier.node.local.name
                  }\` has to be a direct child of a \`ClassProperty\`.`
                );

              const classProperty = classPropertyPath.node;

              classProperty.decorators = [t.decorator(classProperty.value!)];
              classProperty.value = null;
            }
          }
        }
      }
    }
  };
}
