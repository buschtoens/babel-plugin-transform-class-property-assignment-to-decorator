import babel, { PluginObj, NodePath, types, Visitor } from '@babel/core';
import { VisitNodeFunction } from '@babel/traverse';
import { CallExpression, Identifier, Expression } from '@babel/types';

interface State {
  opts: {
    imports: Imports;
  };
}

interface Imports {
  [moduleName: string]: string[];
}

export type FunctionalVisitor<S = {}> = {
  [Type in types.Node['type']]?: VisitNodeFunction<
    S,
    Extract<types.Node, { type: Type }>
  >
} &
  { [K in keyof types.Aliases]?: VisitNodeFunction<S, types.Aliases[K]> };

function toFunctionalVisitor<S, V extends FunctionalVisitor<S>>(
  _state: S,
  visitor: V
): Pick<Required<V>, keyof V> {
  return visitor;
}

export default function transformClassPropertyAssignmentToDecorator({
  types: t
}: typeof babel): PluginObj<State> {
  function getLeftMostCallee(
    callExpressionPath: NodePath<CallExpression>
  ): NodePath<Identifier> | undefined {
    let callee = callExpressionPath.get('callee');
    while (callee.isMemberExpression()) {
      callee = callee.get('object');
    }
    if (!callee.isIdentifier()) {
      return undefined;
    }
    return callee;
  }

  function shouldTransformValue(
    valuePath: NodePath<Expression | null>,
    imports: Imports
  ): valuePath is NodePath<CallExpression> {
    if (!valuePath.isCallExpression()) return false;

    const identifierPath = getLeftMostCallee(valuePath);
    if (!identifierPath) return false;

    const binding = valuePath.scope.getBinding(identifierPath.node.name);
    if (!binding) return false;

    if (
      !binding ||
      !binding.path.isImportSpecifier() ||
      !binding.path.parentPath.isImportDeclaration()
    )
      return false;

    const importName = binding.path.node.imported.name;
    const importModule = binding.path.parentPath.node.source.value;

    return (
      importModule in imports && imports[importModule].includes(importName)
    );
  }

  const pseudoVisitors = toFunctionalVisitor((undefined as unknown) as State, {
    ClassProperty(classPropertyPath, state) {
      const { imports } = state.opts;
      const valuePath = classPropertyPath.get('value');
      // if (!shouldTransformValue(valuePath, imports)) return;

      classPropertyPath.node.value = null;
    }
  });

  return {
    name: require('./package').name as string,
    visitor: {
      Class(classPath, state) {
        console.log(classPath);
        const bodyPath = classPath.get('body');
        const elementPaths = bodyPath.get('body');

        for (const elementPath of elementPaths) {
          if (!elementPath.isClassProperty()) continue;
          pseudoVisitors.ClassProperty.call(state, elementPath, state);
        }
      }
    }
  };
}
