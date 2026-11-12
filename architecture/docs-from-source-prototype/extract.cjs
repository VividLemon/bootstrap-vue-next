const {createChecker} = require('vue-component-meta')
const path = require('path')
const PKG = process.argv[2]
const comps = process.argv.slice(3)
let t0 = Date.now()
const checker = createChecker(path.join(PKG, 'tsconfig.app.json'), {schema: {ignore: ['HTMLAttributes','ClassValue','StyleValue']}, printer: {newLine: 1}})
console.error('checker created', Date.now()-t0, 'ms')
const out = {}
for (const c of comps) {
  t0 = Date.now()
  const file = path.join(PKG, 'src/components', c)
  const meta = checker.getComponentMeta(file)
  const t = Date.now()-t0
  const pick = (x) => ({name: x.name, type: x.type, default: x.default, required: x.required, description: x.description, tags: x.tags.length ? x.tags : undefined, decl: x.getDeclarations().map(d => path.relative(PKG, d.file)+':'+d.range[0]).slice(0,1)[0]})
  out[c] = {
    ms: t,
    props: meta.props.filter(p => !p.global).map(pick),
    globalPropCount: meta.props.filter(p => p.global).length,
    events: meta.events.map(e => ({name: e.name, type: e.type, signature: e.signature, description: e.description})),
    slots: meta.slots.map(pick),
    exposed: meta.exposed.map(e => ({name: e.name, type: e.type})),
  }
}
console.log(JSON.stringify(out, null, 1))
