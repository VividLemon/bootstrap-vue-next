const {createChecker} = require('vue-component-meta'); const path=require('path'); const fs=require('fs')
const ROOT=process.argv[2], PKG=path.join(ROOT,'packages/bootstrap-vue-next'), DATA=path.join(ROOT,'apps/docs/src/data/components')
const jiti=require('jiti').createJiti(__filename)
const vueFiles={}; (function w(d){for(const f of fs.readdirSync(d)){const p=path.join(d,f); if(fs.statSync(p).isDirectory()) w(p); else if(/^B\w+\.vue$/.test(f)) vueFiles[f.slice(0,-4)]=p}})(path.join(PKG,'src/components'))
const flatProps=(props)=>{ if(!props) return {}; const isRec=(v)=>v&&typeof v==='object'&&!('description' in v)&&!('type' in v)&&!('default' in v); const o={}; const add=(r)=>{ r=r._data??r; for(const [k,v] of Object.entries(r)) if(!(k in o)) o[k]=v }; if(props._data) return props._data; if('_defaultPropSection' in props){ add(props._defaultPropSection); for(const [k,v] of Object.entries(props)) if(k!=='_defaultPropSection'&&isRec(v)) add(v); return o } return props }
const _old=(props)=>{ if(!props) return {}; if(props._data) return props._data; const o={}; for(const [k,v] of Object.entries(props)){ if(v && typeof v==='object' && (v._data || (k==='_defaultPropSection'))) Object.assign(o, v._data??v); else if (v && typeof v==='object' && Object.values(v).every(x=>x&&typeof x==='object'&&('description' in x||'type' in x)) && !('description' in v) && !('type' in v)) Object.assign(o, v._data??v); else o[k]=v } return o }
let t0=Date.now(); const checker=createChecker(path.join(PKG,'tsconfig.app.json'),{schema:false})
const report={}; let tot={docOnly:0,srcOnly:0,match:0,typeDiff:0,defDiff:0,slotDocOnly:0,slotSrcOnly:0,evDocOnly:0,evSrcOnly:0}
const samples={docOnly:[],srcOnly:[],typeDiff:[],defDiff:[],slotSrcOnly:[],evSrcOnly:[]}
let metaMs=0, n=0
for (const f of fs.readdirSync(DATA)) {
  let ref; try { ref = jiti(path.join(DATA,f)).default.load() } catch(e) { console.error('load fail',f,e.message.slice(0,100)); continue }
  for (const [name, d] of Object.entries(ref)) {
    const vf=vueFiles[name]; if(!vf){ console.error('no vue for',name); continue }
    const t=Date.now(); const m=checker.getComponentMeta(vf); metaMs+=Date.now()-t; n++
    const src=Object.fromEntries(m.props.filter(p=>!p.global).map(p=>[p.name,p])); const doc=flatProps(d.props)
    for (const k of Object.keys(doc)) { if(!src[k]){tot.docOnly++; samples.docOnly.push(name+'.'+k)} else { tot.match++
      const decl=src[k].getDeclarations()[0]; const txt=decl?fs.readFileSync(path.join(decl.file.startsWith('/')?'':PKG,decl.file),'utf8').slice(decl.range[0],decl.range[1]).replace(/\/\*\*[\s\S]*?\*\//,''):''; const declType=(txt.match(/^\s*['"]?[\w:-]+['"]?\??\s*:\s*([\s\S]*?)\s*;?\s*$/)||[])[1]||src[k].type; const N=(x)=>x.replace(/\s|^\|/g,'').replace(/"/g,"'").split('|').filter(y=>y&&y!=='undefined').sort().join('|'); const dt=N(doc[k].type||''), st=N(declType)
      if (dt!==st) {tot.typeDiff++; samples.typeDiff.push(`${name}.${k}: doc=${doc[k].type} src=${src[k].type}`)}
      const dd=JSON.stringify(doc[k].default), sd=src[k].default
      const norm=(x)=>String(x).replace(/^"|"$/g,'').replace(/^'|'$/g,'')
      if (norm(dd)!==norm(sd) && !(dd===undefined && sd==='undefined')) {tot.defDiff++; samples.defDiff.push(`${name}.${k}: doc=${dd} src=${sd}`)} } }
    for (const k of Object.keys(src)) if(!(k in doc)){tot.srcOnly++; samples.srcOnly.push(name+'.'+k)}
    const ds=new Set(Object.keys(d.slots||{})), ss=new Set(m.slots.map(s=>s.name))
    for(const k of ds) if(!ss.has(k)) tot.slotDocOnly++
    for(const k of ss) if(!ds.has(k)){tot.slotSrcOnly++; samples.slotSrcOnly.push(name+'#'+k)}
    const de=new Set(Object.keys(d.emits||{})), se=new Set(m.events.map(s=>s.name))
    for(const k of de) if(!se.has(k)) tot.evDocOnly++
    for(const k of se) if(!de.has(k)){tot.evSrcOnly++; samples.evSrcOnly.push(name+'@'+k)}
  }
}
console.log('components', n, 'total', Date.now()-t0, 'ms (meta', metaMs, 'ms)'); console.log(tot)
for (const [k,v] of Object.entries(samples)) console.log(k, v.length, '\n   ', v.slice(0,12).join('\n    '))
