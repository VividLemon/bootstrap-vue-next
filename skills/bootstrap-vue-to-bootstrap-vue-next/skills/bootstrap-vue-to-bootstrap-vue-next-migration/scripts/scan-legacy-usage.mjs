#!/usr/bin/env node
// Scan a project for BootstrapVue (Vue 2 / Bootstrap 4) usages that need attention when
// migrating to BootstrapVueNext. Zero dependencies; Node 18+.
//
// Usage:
//   node scan-legacy-usage.mjs <project-dir> [--json] [--category=component,prop,...] [--summary]
//
// Output: one line per hit -> file:line:col [rule-id] message (see <ref>)
// Exit code: 0 when nothing found, 1 when hits were found, 2 on usage error.
// The scan is heuristic (regex based). Every hit is a place to LOOK, not an automatic rewrite.

import {readFileSync, readdirSync, statSync} from 'node:fs'
import {join, relative, extname, dirname} from 'node:path'
import {fileURLToPath} from 'node:url'

const here = dirname(fileURLToPath(import.meta.url))
const {rules} = JSON.parse(readFileSync(join(here, '..', 'assets', 'legacy-patterns.json'), 'utf8'))

const args = process.argv.slice(2)
const root = args.find((a) => !a.startsWith('--'))
if (!root) {
  console.error('usage: node scan-legacy-usage.mjs <project-dir> [--json] [--summary] [--category=a,b]')
  process.exit(2)
}
const asJson = args.includes('--json')
const summaryOnly = args.includes('--summary')
const catArg = args.find((a) => a.startsWith('--category='))
const cats = catArg ? new Set(catArg.split('=')[1].split(',')) : null

const EXT = new Set(['.vue', '.js', '.ts', '.jsx', '.tsx', '.mjs', '.cjs', '.html', '.scss', '.sass', '.css', '.json', '.pug'])
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.nuxt', '.output', 'coverage', '.next', 'vendor'])

const compiled = rules
  .filter((r) => !cats || cats.has(r.category))
  .map((r) => ({...r, re: new RegExp(r.pattern, r.flags.includes('g') ? r.flags : r.flags + 'g')}))

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) yield* walk(p)
    else if (EXT.has(extname(name)) && st.size < 2_000_000 && !name.endsWith('.lock') && name !== 'package-lock.json') yield p
  }
}

const hits = []
for (const file of walk(root)) {
  const text = readFileSync(file, 'utf8')
  const lineStarts = [0]
  for (let i = 0; i < text.length; i++) if (text[i] === '\n') lineStarts.push(i + 1)
  const lineOf = (idx) => {
    let lo = 0, hi = lineStarts.length - 1
    while (lo < hi) {
      const mid = (lo + hi + 1) >> 1
      if (lineStarts[mid] <= idx) lo = mid
      else hi = mid - 1
    }
    return lo
  }
  for (const r of compiled) {
    // JSON files: only dependency-style rules make sense
    if (extname(file) === '.json' && !['setup'].includes(r.category)) continue
    if (/\.(s?css|sass)$/.test(file) && !['bootstrap5', 'setup'].includes(r.category)) continue
    r.re.lastIndex = 0
    let m
    while ((m = r.re.exec(text))) {
      const ln = lineOf(m.index)
      hits.push({
        file: relative(root, file),
        line: ln + 1,
        col: m.index - lineStarts[ln] + 1,
        rule: r.id,
        category: r.category,
        match: m[0].trim(),
        message: r.message,
        ref: r.ref,
      })
      if (m[0].length === 0) r.re.lastIndex++
    }
  }
}

if (asJson) {
  console.log(JSON.stringify(hits, null, 1))
} else {
  const byCat = {}
  for (const h of hits) byCat[h.category] = (byCat[h.category] || 0) + 1
  if (!summaryOnly) {
    for (const h of hits) console.log(`${h.file}:${h.line}:${h.col} [${h.rule}] ${h.match} — ${h.message} (see ${h.ref})`)
    console.log('')
  }
  const byRule = {}
  for (const h of hits) byRule[h.rule] = (byRule[h.rule] || 0) + 1
  console.log(`${hits.length} hit(s) in ${new Set(hits.map((h) => h.file)).size} file(s)`)
  console.log('by category:', JSON.stringify(byCat))
  if (summaryOnly) for (const [k, v] of Object.entries(byRule).sort((a, b) => b[1] - a[1])) console.log(`  ${v}\t${k}`)
}
process.exit(hits.length ? 1 : 0)
