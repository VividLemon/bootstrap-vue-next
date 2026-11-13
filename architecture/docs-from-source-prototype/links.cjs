const ts = require('typescript'), path = require('path')
const PKG = process.argv[2]
const t0 = Date.now()
const cfgPath = path.join(PKG, 'tsconfig.app.json')
const cfg = ts.parseJsonConfigFileContent(ts.readConfigFile(cfgPath, ts.sys.readFile).config, ts.sys, PKG)
const entry = path.join(PKG, 'src/types/index.ts')
const program = ts.createProgram([entry], cfg.options)
const checker = program.getTypeChecker()
const sf = program.getSourceFile(entry)
const resolve = (s) => (s && s.flags & ts.SymbolFlags.Alias) ? checker.getAliasedSymbol(s) : s
// 1. symbol table: every type exported from the public types barrel
const table = new Map() // symbol -> {name, file, kind, text}
for (const ex of checker.getExportsOfModule(checker.getSymbolAtLocation(sf))) {
  const s = resolve(ex)
  if (!(s.flags & (ts.SymbolFlags.Type))) continue
  const d = s.declarations?.[0]; if (!d) continue
  table.set(s, {name: ex.name, file: path.relative(PKG, d.getSourceFile().fileName), kind: ts.SyntaxKind[d.kind], text: d.getText()})
}
console.error('program+table', Date.now() - t0, 'ms;', table.size, 'exported types')
// 2. tokenise a declared type node into text segments + links
function linkify(node) {
  const out = []; const src = node.getSourceFile().text; let pos = node.getStart()
  const visit = (n) => {
    if (ts.isTypeReferenceNode(n) || ts.isExpressionWithTypeArguments(n)) {
      const id = ts.isTypeReferenceNode(n) ? n.typeName : n.expression
      const s = resolve(checker.getSymbolAtLocation(ts.isQualifiedName(id) ? id.right : id))
      const start = id.getStart()
      out.push({text: src.slice(pos, start)}); 
      const e = s && table.get(s)
      out.push(e ? {text: id.getText(), ref: e.name} : {text: id.getText(), ref: null, external: s ? path.relative(PKG, s.declarations?.[0]?.getSourceFile().fileName ?? '?') : '?'})
      pos = id.getEnd()
    }
    ts.forEachChild(n, visit)
  }
  visit(node); out.push({text: src.slice(pos, node.getEnd())})
  return out.filter(x => x.text)
}
const iface = (name) => resolve(checker.getExportsOfModule(checker.getSymbolAtLocation(sf)).find(e => e.name === name))
const show = (name, props) => {
  const t = checker.getDeclaredTypeOfSymbol(iface(name))
  for (const p of checker.getPropertiesOfType(t)) {
    if (props && !props.includes(p.name)) continue
    const d = p.declarations[0]
    const segs = linkify(d.type)
    console.log(`${name}.${p.name}:`, segs.map(s => s.ref ? `[${s.text}](#${s.ref})` : s.ref === null ? `{${s.text}?${s.external}}` : s.text).join(''))
  }
}
show('BRowProps'); show('BModalProps', ['okVariant', 'size', 'focus', 'bodyAttrs', 'teleportTo']); show('BTableProps', ['fields', 'provider', 'tbodyTrClass', 'sortBy'])
// 3. closure: from all B*Props/B*Slots/B*Emits, how many types are reachable, and how big?
const seen = new Map(); const depthOf = new Map()
const queue = []
for (const [s, e] of table) if (/^B\w+(Props|Slots|Emits)$/.test(e.name)) { queue.push([s, 0]) }
let maxDepth = 0, externals = new Set()
while (queue.length) {
  const [s, depth] = queue.shift(); if (seen.has(s)) continue
  seen.set(s, depth); maxDepth = Math.max(maxDepth, depth)
  for (const d of s.declarations ?? []) {
    const v = (n) => { if (ts.isTypeReferenceNode(n) || ts.isExpressionWithTypeArguments(n)) { const id = ts.isTypeReferenceNode(n) ? n.typeName : n.expression; const r = resolve(checker.getSymbolAtLocation(ts.isQualifiedName(id) ? id.right : id)); if (r && r.declarations?.length) { const f = r.declarations[0].getSourceFile(); if (f.fileName.includes('node_modules') || program.isSourceFileDefaultLibrary(f)) externals.add(r.name); else if (!seen.has(r)) queue.push([r, depth + 1]) } } ts.forEachChild(n, v) }
    v(d)
  }
}
const local = [...seen.keys()]
const notExported = local.filter(s => !table.has(s) && !(s.flags & ts.SymbolFlags.TypeParameter)).map(s => s.name)
console.error('closure', Date.now() - t0, 'ms;', local.length, 'local types reachable, max depth', maxDepth, '; not exported from barrel:', notExported.length, notExported.slice(0, 15).join(','), '; external leaves:', externals.size, [...externals].slice(0, 25).join(','))
const sizes = local.filter(s => table.has(s)).map(s => [table.get(s).name, table.get(s).text.length]).sort((a, b) => b[1] - a[1])
console.error('largest defs', sizes.slice(0, 6).map(x => x.join(':')).join(', '), ' total chars', sizes.reduce((a, b) => a + b[1], 0))
console.log('\n--- GutterNumbers ---\n' + [...table.values()].find(e => e.name === 'GutterNumbers').text)
console.log('--- Responsive ---\n' + [...table.values()].find(e => e.name === 'Responsive').text + '\n  @ ' + [...table.values()].find(e => e.name === 'Responsive').file)
