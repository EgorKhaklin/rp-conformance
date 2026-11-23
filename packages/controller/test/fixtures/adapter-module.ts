// An adapter module of a user's own, as `--adapter <path>` loads it (adapter-module.test.ts).
export function createAdapter() {
  return { name: 'fixture' };
}
