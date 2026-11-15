# BootstrapVueNext agent skills

[Agent skills](https://agentskills.io) published by this project. A skill is a folder with a
`SKILL.md` and supporting files that coding agents (Claude Code, Codex, Copilot, Cursor and others)
load when a task matches it.

The skills here are for people **using** BootstrapVueNext. The skills that help contributors work on
this repository live in `.agents/skills/` and are installed from other projects.

## Skill sets

Each folder in `skills/` is one **skill set** for one migration path. Each set is also a Claude Code
plugin, so it installs as a unit.

| Skill set | Migration path | Status |
| --- | --- | --- |
| [`bootstrap-vue-to-bootstrap-vue-next`](./bootstrap-vue-to-bootstrap-vue-next/) | BootstrapVue (Vue 2, Bootstrap 4) → BootstrapVueNext **v1** (Vue 3, Bootstrap 5) | Available. Verified against bootstrap-vue 2.23.1 and bootstrap-vue-next 1.2.4 |
| BootstrapVueNext v1 → the next major version | BootstrapVueNext v1 → the Bootstrap 6 release | Planned. Written at the end of the Bootstrap 6 migration |

The sets don't overlap. `bootstrap-vue-to-bootstrap-vue-next` only covers moving off BootstrapVue; it
is not the guide for upgrading an existing BootstrapVueNext app to a newer major version.

## Install

With the [`skills` CLI](https://skills.sh) (Claude Code, Codex, Copilot, Cursor and other agents):

```bash
npx skills add bootstrap-vue-next/bootstrap-vue-next --skill bootstrap-vue-to-bootstrap-vue-next-migration
```

`--skill` picks this skill only. Without it, the CLI also lists the contributor skills in this
repository's `.agents/skills/`, which aren't meant for app projects.

With Claude Code's plugin marketplace:

```bash
claude plugin marketplace add bootstrap-vue-next/bootstrap-vue-next
claude plugin install bootstrap-vue-to-bootstrap-vue-next@bootstrap-vue-next
```

On Claude Code 2.1.275 or later, one command inside a session does both:

```text
/plugin install bootstrap-vue-to-bootstrap-vue-next --marketplace bootstrap-vue-next/bootstrap-vue-next
```

Both install from the repository's default branch (`main`).

## Layout

```text
.claude-plugin/marketplace.json        ← lists every skill set as a plugin
skills/
  <skill-set>/                         ← one migration path; a Claude Code plugin root
    .claude-plugin/plugin.json
    skills/
      <skill-name>/SKILL.md            ← the skill (references/, scripts/, assets/, templates/)
```

To add a skill set, create `skills/<skill-set>/` in this shape and add an entry for it to
`.claude-plugin/marketplace.json`.

## Maintenance

`bootstrap-vue-to-bootstrap-vue-next-migration/references/upstream-guide/` is a copy of the docs
site's migration guide (`apps/docs/src/docs/migration-data/`) at the time the skill was written. An
installed skill only gets its own folder, so it can't link to the docs. When the migration guide
changes, update the copy by hand.
