const fs = require('fs');
const glob = require('glob');
const parser = require('@babel/parser');
const traverse = require('@babel/traverse').default;

const files = glob.sync('src/**/*.js', { cwd: process.cwd() });

files.forEach(file => {
  try {
    const code = fs.readFileSync(file, 'utf8');
    const ast = parser.parse(code, {
      sourceType: 'module',
      plugins: ['jsx', 'classProperties']
    });

    traverse(ast, {
      JSXExpressionContainer(path) {
        const expr = path.node.expression;
        if (expr.type === 'StringLiteral' || expr.type === 'NumericLiteral' || expr.type === 'LogicalExpression' || expr.type === 'ConditionalExpression') {
          // If parent is not Text or something else
          let parent = path.parent;
          if (parent.type === 'JSXElement') {
             const parentName = parent.openingElement?.name?.name;
             if (parentName && parentName !== 'Text') {
                 console.log(`Found expression inside <${parentName}> in ${file}:${path.node.loc.start.line}`);
             }
          }
        }
      }
    });
  } catch (e) {
  }
});
