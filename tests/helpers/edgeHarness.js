import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

// Execute the unchanged Deno source with test-only imports and globals.
// No module mocks, process globals, credentials, sockets, or real fetches.
export function loadEdgeSource(path, bindings = {}, exports = []) {
  const source = readFileSync(new URL(`../../supabase/functions/${path}`, import.meta.url), 'utf8');
  const executable = new Bun.Transpiler({ loader: 'ts' }).transformSync(
    source.replace(/^import .*;\r?\n/gm, '').replace(/^export /gm, '')
  );
  let handler;
  const background = [];
  const capture = cb => { handler = cb; };
  const context = {
    Request, Response, Headers, URL, AbortController, DOMException, setTimeout, clearTimeout,
    console: { log() {}, warn() {}, error() {} },
    fetch: async () => { throw new Error('Unexpected network request in test'); },
    serve: capture,
    Deno: { env: { get: key => ({ SUPABASE_URL: 'https://cloud.test', SUPABASE_SERVICE_ROLE_KEY: 'test-only' })[key] }, serve: capture },
    EdgeRuntime: { waitUntil: work => background.push(work) },
    ...bindings,
  };
  runInNewContext(executable + (exports.length ? `\nglobalThis.testExports = { ${exports.join(',')} };` : ''), context);
  return { handler, exports: context.testExports, drain: async () => { await Promise.all(background); } };
}

export function fakeDb(resolve) {
  const queries = [];
  const client = { from(table) {
    const op = { table, filters: [] };
    queries.push(op);
    const finish = async () => resolve(op);
    const q = {
      select(fields, options) { op.select = fields; op.options = options; return q; },
      eq(key, value) { op.filters.push([key, value]); return q; },
      is(key, value) { op.filters.push([key, value]); return q; },
      insert(data) { op.kind = 'insert'; op.data = data; return q; },
      upsert(data, options) { op.kind = 'upsert'; op.data = data; op.upsertOptions = options; return q; },
      update(data) { op.kind = 'update'; op.data = data; return q; },
      single: finish, maybeSingle: finish,
      then(ok, fail) { return finish().then(ok, fail); },
    };
    return q;
  } };
  return { client, queries };
}