# Peer Advisor Tech Department — Website

The site for PATD, a student-run engineering studio: a professional, monochrome-luxe
showcase of our capabilities, selected work, and team.

Built with **React 19, Vite, Tailwind CSS v4, React Router, Framer Motion, and Lenis**
(smooth scroll). Typography is **self-hosted via Fontsource** — no external font CDN.

## The pathway

```
Nav (everywhere):  PATD · Work · Team · Contact · [ Sign in ]
Home (/):     Hero → Capabilities (#about) → Work (#work) → Team (#team) → Contact (#contact)
Case study (/project/:id):   project → related work → contact
Team (/team · /team/:id):    contributor catalog → profile pages
```

## Run

```bash
npm install
npm run dev      # local dev server (web :3200 + API :3001)
npm run build    # production build → dist/
npm run preview  # preview the build
npm run lint     # ESLint
```

## Sign in with Launchpad

Production (`npm start`) uses Launchpad OAuth by default. The `/access` page
offers **Continue with Launchpad**, and the backend validates the access token
with Launchpad before creating an HttpOnly session cookie. Password sign-in and
registration are disabled while OAuth is enabled.

For the hosted site, set these server-side values (never `VITE_` variables):

```dotenv
LAUNCHPAD_AUTH_REQUIRED=true
APP_ORIGIN=https://patech.standardcas.org
LAUNCHPAD_ISSUER=https://launchpad.standardcas.org
HTTPS=true
```

`APP_ORIGIN` must be the exact public HTTPS origin, without a trailing slash.
Launchpad supplies `/dashboard-api/oauth/sdk.js`, the same-origin OAuth bridge,
and `/__lp_auth/callback`. Bind the app's domain in Launchpad before signing in.
For an existing deployment, preserve `.env` and the entire `server/.data/`
directory when updating source, rebuild the frontend, and restart the backend.
Check `/api/auth/config` returns `{"oauth":true}` after deployment; a 404 means
the running backend predates the integration.

Accounts are matched by Launchpad's stable subject, never automatically by
email. Optional `LAUNCHPAD_ADMIN_SUB` and `LAUNCHPAD_ADMIN_VID` must both match
the administrator's verified Launchpad identity; otherwise accounts are members.
Keep existing values when updating an established workspace.

Local `npm run dev` retains password login when the setting is absent. Explicit
`LAUNCHPAD_AUTH_REQUIRED=false` also enables that development flow. OAuth requires
the Launchpad bridge; Vite alone does not supply it.

Run `npm run test:oauth` for identity-validation and HTTP session checks.

## Structure

```
src/
  data/
    site.js        # ← all site copy, links & derived stats (edit this)
    projects.js    # ← projects + team rosters (edit this)
    people.js      # ← the team roster (edit this)
  components/
    LandingPage.jsx   Hero + capabilities
    WorkIndex.jsx     Ruled index of every project (#work)
    TeamStrip.jsx     Home-page roster preview (#team)
    People.jsx        Full contributor catalog (/team)
    PersonPage.jsx    Member profile (/team/:id)
    Contact.jsx       Closing contact section (#contact)
    ProjectDetail.jsx Case-study page
    Access.jsx        Register / login portal (/access)
    Reveal.jsx        Reveal-on-scroll helper (reduced-motion aware)
  lib/
    smoothScroll.js   Lenis-aware scroll helpers
  App.jsx          Nav, routing, footer, smooth-scroll setup, page meta
  index.css        Design tokens, utilities, reduced-motion
```

Secondary routes (`/team`, `/project/:id`, `/access`, `/workspace`) are
code-split with `React.lazy`, so the landing bundle stays lean. `public/`
ships `robots.txt` and a generated `sitemap.xml` — regenerate the sitemap
when projects or people change.

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
