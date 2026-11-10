const {parse} = require('vue-docgen-api'); const path=require('path')
const PKG=process.argv[2]
;(async()=>{ for (const c of ['BContainer/BRow.vue','BModal/BModal.vue','BTable/BTable.vue']) {
  try { const d = await parse(path.join(PKG,'src/components',c))
  console.log('==',c,'props',(d.props||[]).length,'events',(d.events||[]).length,'slots',(d.slots||[]).length)
  console.log(JSON.stringify((d.props||[]).slice(0,3)), JSON.stringify((d.slots||[]).slice(0,2)), JSON.stringify((d.events||[]).slice(0,2)))
  } catch(e){console.log('==',c,'ERROR',e.message.slice(0,200))} }})()
