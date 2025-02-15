export function getTruncatedFunctionDefinition(funcStr: string): string {
  const returnStatements = funcStr.match(/return\s+[^;]+;/g) || [];
  let truncatedReturnStatements = returnStatements.map(statement => statement.trim()).join(' ... ');

  if (returnStatements.length === 0) {
    // Handle single-line fat arrow functions without return keyword
    const singleLineReturnMatch = funcStr.match(/=>\s*([^;]+)/);


    if (singleLineReturnMatch) {
      return funcStr;
    } else {
      truncatedReturnStatements = '';
    }
  }

  let signature = '';
  if (funcStr.startsWith('function')) {
    // Named or unnamed function
    const match = funcStr.match(/function\s*([^(]*)\(([^)]*)\)/);
    if (match) {
      signature = `function ${match[1]}(${match[2]})`;
    }
  } else if (funcStr.startsWith('(') || funcStr.startsWith('async (')) {
    // Fat arrow function
    const match = funcStr.match(/^(async\s*)?\(([^)]*)\)\s*=>/);
    if (match) {
      signature = `${match[1] || ''}(${match[2]}) =>`;
    }
  } else {
    // Method shorthand or other cases
    const match = funcStr.match(/([^(]+)\(([^)]*)\)/);
    if (match) {
      signature = `${match[1]}(${match[2]})`;
    }
  }

  return `${signature} { ... ${truncatedReturnStatements} }`.replace('return {\\n    }','');
}
