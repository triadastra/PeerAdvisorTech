# Editing the site content

Three data files drive almost everything. No React required.

| What you want to change | File |
| --- | --- |
| Site name, hero copy, capabilities, contact, links, nav | `src/data/site.js` |
| Projects (the specs) and their details | `src/data/projects.js` |
| People — the team, chronological order, class years, leadership | `src/data/people.js` |

Preview with `npm run dev`, then `npm run build` to ship.

---

## Add or edit a project (a spec)

Add an object to the `projects` array in `src/data/projects.js`. **Its `spec` number is
the catalog number** (00, 01, …) shown in the Work index and on its page.

```js
{
  id: 'my-project',          // unique, url-safe (used in /project/my-project)
  spec: 11,                  // catalog number
  title: 'My Project',
  caption: 'One sharp sentence.',
  category: 'Platform',      // discipline; also a filter in the Work index
  tier: 'Core',              // optional — shows a "Layer" row
  affiliation: 'StandardCAS™', // optional
  status: 'In development',  // shown in the index meta and the spec header
  bio: 'A paragraph about the project.',
  techStack: ['React', 'Node.js'],
  highlights: ['Something we are proud of'], // optional — omit to hide "Highlights"
  workDescriptions: [{ title: 'What we did', description: 'Details.' }],
}
```

**Team is NOT listed here.** Each spec's team is derived from `people.js` (see below), so
leadership has a single source of truth.

## Edit the team (`src/data/people.js`)

`people.js` is the single source of truth for who's who and who leads what. Each person:

```js
{
  id: 'first-last', name: 'First Last', year: '27', avatar: 'FL',
  status: 'active' | 'away',
  title: 'Lead — Some Spec',                 // shown on the People page
  leads: 'all'                                // Leads every spec, OR…
       | [{ n: 2, role: 'Lead' }, { n: 4, role: 'Co-lead' }], // specs they lead, by number
  insights: 'A sentence or two shown when their profile is expanded.',
}
```

- The People page (`/team`) displays everyone as one team in array order.
- **`leads`** drives each spec page's Team section via `teamForSpec(n)`. `'all'` puts the
  person on every spec; an array assigns specific specs with a role.
- **`status: 'away'`** shows an "Away" badge.
- Team profiles get a chromatic name reveal when opened.

## Site text, capabilities, contact & nav — `src/data/site.js`

- `kicker` / `headline` (two lines) / `lede` — the hero.
- `nav` — navbar items. `{ target: 'work' }` scrolls to a home section; `{ route: '/team' }`
  navigates to a page.
- `capabilities.{ heading, blurb, items[{ title, text }] }` — the "What we build" list (#about).
- `contact.{ heading[2], blurb, primary, secondary, links[] }` — closing CTA. **Put your
  real email / GitHub / SharedSpace here.**
- `footerNote` and `footerCredit` — the footer lines.

## Stats are automatic

Hero/footer numbers (projects, builders, disciplines, years) are computed in `siteStats`
(`src/data/site.js`) from the data. Don't hardcode them.

## Retint the whole site

The accent and neutral palette are CSS tokens in `src/index.css` (`--color-acid-500`,
`--color-ink-*`). Change `--color-acid-500` to re-accent everything.
