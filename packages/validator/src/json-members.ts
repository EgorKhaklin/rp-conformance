// Duplicate member names in JSON text (RFC 8259 section 4, RFC 7515 section 4, RFC 7519 section 4): JSON.parse keeps
// the last of two members with the same name, so a check of the parsed object cannot see the first one.

interface Frame {
  kind: 'object' | 'array';
  names: Set<string>;
  /** In an object: the next string is a member name. */
  expectName: boolean;
}

/**
 * The first member name that occurs twice in one object of `text`, or undefined. `text` is valid JSON; the scan
 * tracks the member names of each open object and skips strings, so names inside values are not counted.
 */
export function duplicateMember(text: string): string | undefined {
  const stack: Frame[] = [];
  let i = 0;
  while (i < text.length) {
    const c = text[i];
    const top = stack[stack.length - 1];
    if (c === '"') {
      let end = i + 1;
      while (end < text.length && text[end] !== '"') end += text[end] === '\\' ? 2 : 1;
      const value = JSON.parse(text.slice(i, end + 1)) as string;
      i = end + 1;
      if (top?.kind === 'object' && top.expectName) {
        if (top.names.has(value)) return value;
        top.names.add(value);
        top.expectName = false;
      }
      continue;
    }
    if (c === '{') stack.push({ kind: 'object', names: new Set(), expectName: true });
    else if (c === '[') stack.push({ kind: 'array', names: new Set(), expectName: false });
    else if (c === '}' || c === ']') stack.pop();
    else if (c === ',' && top?.kind === 'object') top.expectName = true;
    i++;
  }
  return undefined;
}
