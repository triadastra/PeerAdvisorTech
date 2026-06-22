# Peer Advisor Tech Department — Website

The site for PATD, a student-run engineering studio: a professional, monochrome-luxe
showcase of our capabilities, selected work, and team.

Built with **React 19, Vite, Tailwind CSS v4, React Router, Framer Motion, and Lenis**
(smooth scroll). Typography is **self-hosted via Fontsource** — no external font CDN.

## The pathway

```
Nav (everywhere):  PATD · Work · Team · About · [ Contact ]
Home (/):     Hero → Capabilities (#about) → Work (#work) → Team (#team) → Contact (#contact)
Case study (/project/:id):   project → related work → contact
```

## Run

```bash
npm install
npm run dev      # local dev server
npm run build    # production build → dist/
npm run preview  # preview the build
npm run lint     # ESLint
```

## Structure

```
src/
  data/
    site.js        # ← all site copy, links & derived stats (edit this)
    projects.js    # ← projects + team rosters (edit this)
  components/
    LandingPage.jsx   Hero + capabilities
    WorkIndex.jsx     Ruled index of every project (#work)
    Team.jsx          Credits masthead (#team)
    Contact.jsx       Closing contact section (#contact)
    ProjectDetail.jsx Case-study page
    Reveal.jsx        Reveal-on-scroll helper (reduced-motion aware)
  lib/
    smoothScroll.js   Lenis-aware scroll helpers
  App.jsx          Nav, routing, footer, smooth-scroll setup
  index.css        Design tokens, utilities, reduced-motion
```

## Design system

- **Monochrome luxe** — warm near-black + warm white + a single acid accent. The whole
  palette is tokens in `src/index.css` (`--color-ink-*`, `--color-acid-500`); change one
  line to retint the site.
- **Type** — Space Grotesk (display) · Inter (body) · JetBrains Mono (technical labels).
- **No cards** — hairline rules and a ruled "ledger" project index instead of boxes.
- **Honest** — hero/footer numbers are computed from the data, never hardcoded.
- **Accessible** — everything respects `prefers-reduced-motion` (smooth scroll and
  animations switch off), with self-hosted fonts and no third-party requests.

## Editing content

You should not need to touch components for normal updates. See **[CONTENT.md](./CONTENT.md)**.
