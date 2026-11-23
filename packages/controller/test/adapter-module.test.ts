import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { isAdapterPath, resolveAdapter } from '../src/adapter-module';

const builtIn = { reference: { load: async () => ({ createAdapter: () => ({ name: 'reference' }) }), dir: 'reference' } };
const fixture = fileURLToPath(new URL('./fixtures/adapter-module.ts', import.meta.url));

describe('--adapter', () => {
  it('takes a built-in adapter by its name', () => {
    expect(isAdapterPath('reference')).toBe(false);
    expect(resolveAdapter('reference', builtIn, 'adapter').dir).toBe('reference');
  });

  it('names the built-in adapters when the name is unknown', () => {
    expect(() => resolveAdapter('nope', builtIn, 'adapter')).toThrow(/adapters: reference, or the path/);
  });

  it('loads an adapter module by its path, without a default ICS', async () => {
    expect(isAdapterPath('my-adapter.ts')).toBe(true);
    expect(isAdapterPath('./adapters/rp')).toBe(true);
    const entry = resolveAdapter(fixture, builtIn, 'adapter');
    expect(entry.dir).toBeUndefined();
    expect((await entry.load()).createAdapter()).toEqual({ name: 'fixture' });
  });

  it('rejects a module without createAdapter()', async () => {
    const entry = resolveAdapter(fileURLToPath(new URL('../src/adapter-module.ts', import.meta.url)), builtIn, 'adapter');
    await expect(entry.load()).rejects.toThrow(/exports no createAdapter/);
  });
});
