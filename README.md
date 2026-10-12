# Askari Sbeity — Portfolio

A responsive, dark editorial portfolio built with semantic HTML, CSS, and vanilla JavaScript for GitHub Pages.

## Design and interactions

- Near-black, charcoal, soft white, and restrained burgundy accents.
- Animated hero statement cycling through **design / build / lead**, paired with the supplied portrait and floating developer-terminal details.
- Horizontal, snap-driven project reel with keyboard-accessible project details, category filters, arrow controls, and animated progress.
- Projects: Syncora, ChefMate Web, ChefMate Mobile, Krispy Tender, Krispy Tender Database System, TCP Recipe Exchange, and Expense Tracker. Sbeity Medical Center is intentionally excluded.
- Redesigned experience and leadership list, scroll-animated timeline, process steps, awards and certifications, and a contact form.
- Floating back-to-top control, responsive navigation, scroll progress, reveal animations, and reduced-motion support.

## Run locally

Open `index.html` in a browser, or run a local server from this folder:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy to GitHub Pages

Commit the contents of this folder to the root of `AskariSbeity/portfolio` on the branch configured for GitHub Pages. The site uses relative asset paths and does not require a build step.

## Update content

- Main page content: `index.html`.
- Project metadata and interactions: `script.js`.
- Styling and responsive layout: `style.css`.
- Portrait: `askari-burgundy-portrait.jpeg`.
- Résumé: `resume.pdf`.
- Project visuals: `chefmate-mobile.webp` and `krispy-thumbnail.webp`.

The Syncora and Expense Tracker visuals are illustrative CSS mockups, not screenshots of a deployed application. Verify project details and repository links before publishing any additional claims. The contact form uses the existing EmailJS account configuration from the prior portfolio; test it after deployment.


## v3 changes
- Original design kept; portrait now shares the page black and dissolves into it; accent colors unified with the photo's rose ring.
- Hero "I design / I build / I lead": three lines, active line wipes in, auto-cycles (click to choose).
- Projects: scroll-driven 3D gallery with four layouts (Ring, Wall, Helix, Cascade) that morph into each other. Scroll, drag, arrows or keyboard. Click the front card for the full write-up (content lives in `projectData` in `script.js`).
- Certificates: HackerRank, Saylor CS302, IBM GenAI added as NEW.
- Contact form: EmailJS SDK added to `index.html`, with a REST fallback in `script.js`.
- Back to top: working, with a scroll-progress ring.

## v4 changes
- Removed the "More clarity. Less chaos." Syncora section (Syncora is still a project in the 3D gallery).
- Section order: Home, About, Projects, Experience, (Timeline), Contact, Skills, Process, Awards. Nav matches.
- Awards: new certificate-gallery design with real certificate previews (`/certs`), issuer filters and a viewer. "Get Connected" removed; HP LIFE x2, OpenLearn, IBM, Saylor, HackerRank added.
- Footer back-to-top removed; the floating back-to-top is now a glass orb with a progress ring.
- Projects: Helix layout only (layout switcher removed).
- Hero: grid + glow + noise background, cursor spotlight, portrait/terminal parallax, animated orbits, stats, tech marquee. "Scroll to explore" removed.
