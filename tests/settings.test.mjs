import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';

// Exercise the actual component handlers with deterministic hooks and Supabase responses.
function harness(options = {}) {
  const state = [], refs = [], effects = [], calls = [];
  let cursor = 0, refCursor = 0;
  const props = { user: { id: 'user-id', name: 'Original', avatarUrl: null }, theme: 'theme-blue',
    onThemeChange: value => calls.push(['theme', value]), onClose: () => calls.push(['close']),
    onNameUpdate: (...value) => calls.push(['profile', ...value]) };
  const react = {
    useState: value => { const i = cursor++; if (!(i in state)) state[i] = value; return [state[i], next => { state[i] = next; }]; },
    useRef: value => { const i = refCursor++; return refs[i] ||= { current: value }; },
    useEffect: callback => { effects.push(callback); },
    useCallback: callback => callback, startTransition: callback => callback(),
  };
  const jsx = (type, props) => ({ type, props });
  const storage = {
    upload: async (...args) => { calls.push(['upload', ...args]); if (options.uploadThrows) throw new Error('Network failure'); return { error: options.uploadError || null }; },
    getPublicUrl: path => ({ data: { publicUrl: `https://storage.example/${path}` } }),
    remove: async paths => { calls.push(['remove', paths]); return { error: null }; },
  };
  const supabase = { storage: { from: () => storage }, from: () => ({
    update: value => { calls.push(['update', value]); return { eq: () => ({ select: () => ({ single: async () => ({ error: options.saveError || null, data: { display_name: value.display_name, avatar_url: value.avatar_url } }) }) }) }; },
  }) };
  const source = readFileSync('src/components/SettingsDialog.tsx', 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
  const compiledModule = { exports: {} };
  vm.runInNewContext(output, { module: compiledModule, exports: compiledModule.exports, console,
    crypto: { randomUUID: () => 'photo-id' }, URL: { createObjectURL: () => 'blob:preview', revokeObjectURL: url => calls.push(['revoke', url]) },
    require: name => name === 'react' ? react : name === 'react/jsx-runtime' ? { jsx, jsxs: jsx } : name === '@/lib/supabase' ? { supabase } : name === '@/lib/taskflow' ? { errorText: e => e.message } : name === 'lucide-react' ? {} : { default: name },
  });
  function render() { cursor = 0; refCursor = 0; return compiledModule.exports.default(props); }
  function find(predicate, tree = render()) {
    if (!tree || typeof tree !== 'object') return;
    if (predicate(tree)) return tree;
    for (const child of [tree.props?.children].flat(Infinity)) { if (child === undefined) continue; const result = find(predicate, child); if (result) return result; }
  }
  function select(file) { find(n => n.type === 'input' && n.props.type === 'file').props.onChange({ target: { files: [file], value: '' } }); }
  return { calls, props, find, select, save: () => find(n => n.type === 'button' && ['Salvar alterações', 'Salvando...'].includes(n.props.children)).props.onClick() };
}

test('Supabase profile error remains visible without closing or changing local user', async () => {
  const h = harness({ saveError: { message: 'Permission denied' } });
  await h.save();
  assert.equal(h.find(n => n.props.role === 'alert').props.children, 'Permission denied');
  assert.equal(h.calls.some(c => c[0] === 'profile' || c[0] === 'close'), false);
});

test('invalid formats, empty files and files above 2 MB never upload', async () => {
  for (const file of [{ name: 'a.svg', type: 'image/svg+xml', size: 100 }, { name: 'a.png', type: 'image/jpeg', size: 2097153 }, { name: 'a.gif', type: 'image/gif', size: 0 }]) {
    const h = harness(); h.select(file);
    assert.ok(h.find(n => n.props.role === 'alert'));
    await h.save();
    assert.equal(h.calls.some(c => c[0] === 'upload'), false);
  }
});

test('JPG, GIF and PNG at the exact 2 MB limit upload before persisting the profile', async () => {
  for (const [name, type] of [['a.jpg', 'image/jpeg'], ['a.gif', 'image/gif'], ['a.png', 'image/png']]) {
    const h = harness(); h.select({ name, type, size: 2097152 });
    assert.equal(h.calls.length, 0, 'selection only previews');
    await h.save();
    assert.deepEqual(h.calls.map(c => c[0]), ['upload', 'update', 'profile', 'close']);
    assert.match(h.calls[0][1], /^user-id\/photo-id\.(jpg|gif|png)$/);
    assert.match(h.calls[1][1].avatar_url, /^https:\/\/storage.example\//);
  }
});

test('upload errors and rejected network requests do not save the profile', async () => {
  for (const options of [{ uploadError: { message: 'Bucket not found' } }, { uploadThrows: true }]) {
    const h = harness(options); h.select({ name: 'a.png', type: 'image/png', size: 10 }); await h.save();
    assert.ok(h.find(n => n.props.role === 'alert'));
    assert.deepEqual(h.calls.map(c => c[0]), ['upload']);
  }
});

test('failed profile update cleans up the uploaded file and preserves the selected photo for retry', async () => {
  const h = harness({ saveError: { message: 'Profile failed' } }); h.select({ name: 'a.png', type: 'image/png', size: 10 }); await h.save();
  assert.deepEqual(h.calls.map(c => c[0]), ['upload', 'update', 'remove']);
  assert.equal(h.find(n => n.props.role === 'alert').props.children, 'Profile failed');
  assert.equal(h.find(n => n.props.alt === 'Foto do perfil').props.src, 'blob:preview');
});

test('duplicate saves cannot upload twice', async () => {
  const h = harness(); h.select({ name: 'a.png', type: 'image/png', size: 10 });
  await Promise.all([h.save(), h.save()]);
  assert.equal(h.calls.filter(c => c[0] === 'upload').length, 1);
});

test('appearance buttons retain selected state and change all five existing themes', () => {
  const h = harness();
  for (const [title, theme] of [['Roxo', 'theme-purple'], ['Azul', 'theme-blue'], ['Esmeralda', 'theme-emerald'], ['Rosa', 'theme-rose'], ['Claro', 'theme-light']]) {
    const button = h.find(n => n.props.title === title);
    assert.equal(button.props['aria-pressed'], theme === h.props.theme);
    button.props.onClick(); assert.equal(h.calls.at(-1)[1], theme);
  }
});

test('workspace applies the chosen theme, stores it, and restores it after remount', () => {
  const saved = new Map();
  function workspace() {
    let cursor = 0;
    const state = [], effects = [];
    const jsx = (type, props) => ({ type, props });
    const compiledModule = { exports: {} };
    const source = readFileSync('src/components/WorkspaceApp.tsx', 'utf8');
    const output = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX } }).outputText;
    vm.runInNewContext(output, { module: compiledModule, exports: compiledModule.exports,
      localStorage: { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) },
      window: { setTimeout: callback => { callback(); return 1; }, clearTimeout: () => {} },
      require: name => name === 'react' ? {
        useState: value => { const i = cursor++; if (!(i in state)) state[i] = value; return [state[i], next => { state[i] = typeof next === 'function' ? next(state[i]) : next; }]; },
        useCallback: callback => callback, useEffect: callback => { effects.push(callback); },
      } : name === 'react/jsx-runtime' ? { jsx, jsxs: jsx } : name === 'next/navigation' ? { useRouter: () => ({}) } : name === '@/lib/taskflow' ? { initials: () => 'ME' } : name === 'lucide-react' ? {} : { default: name },
    });
    function render() { cursor = 0; effects.length = 0; return compiledModule.exports.default(); }
    function find(tree, predicate) {
      if (!tree || typeof tree !== 'object') return;
      if (predicate(tree)) return tree;
      for (const child of [tree.props?.children].flat(Infinity)) { const result = find(child, predicate); if (result) return result; }
    }
    render(); effects[1](); // Theme restoration; other effects need an authenticated backend.
    return { render, open: () => find(render(), n => n.type === 'button' && n.props.title === 'Configurações').props.onClick(), settings: () => find(render(), n => n.type === './SettingsDialog') };
  }
  for (const theme of ['theme-purple', 'theme-blue', 'theme-emerald', 'theme-rose', 'theme-light']) {
    const app = workspace(); app.open(); app.settings().props.onThemeChange(theme);
    assert.equal(app.render().props.className, `tf-app ${theme}`);
    assert.equal(saved.get('tf-theme'), theme);
    assert.equal(workspace().render().props.className, `tf-app ${theme}`);
    assert.ok(readFileSync('src/app/dashboard/workspace.css', 'utf8').includes(`.tf-app.${theme}`));
  }
});
