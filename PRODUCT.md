# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: senior hiring decision-makers (VP Design, CPO, CEO) evaluating Nimit Mangal for a design leadership role. They spend about 90 seconds on the landing page, then open one case study.

Audience is both Indian product companies and global companies hiring remote. Indian context is primary but must stay legible to a reader outside India.

## Product Purpose

A personal portfolio that makes the reader experience one claim rather than read it: design leadership is the ability to change altitude without losing resolution, moving from a 2px misalignment to a revenue model to a team structure, and knowing which altitude a problem lives at.

Success: the reader concludes the designer can independently take an ambiguous, high-impact product problem, understand the system around it, align multiple stakeholders, make difficult decisions, and drive a better business and user outcome. Then they make contact.

## Positioning

- Developer → designer → design leader. Knows the build cost of every decision.
- 13 years in one domain (real-estate tech) across PropTiger, Makaan and Housing.com. Systems memory.
- Revenue-side design: credits, event slots, trust signals. Design that changed business models, not only screens.

The site's title framing is **design leader**: title-neutral, not anchored to the current Principal Designer level and not claiming Head of Design.

## Operating Context

- Readers arrive from a link (application, referral, LinkedIn) on desktop or phone.
- Two reading speeds: the full ascent (60–90 seconds of scrolling) and a 30-second one-pager (`/brief`) as an always-available exit.
- Case studies are entered as doorways from the chapter where the problem lives (Journey, Business), not from a grid.
- Case study narrative follows six beats: stakes, knot, reframe, decisions, cost, aftermath.

## Capabilities and Constraints

- Static site: Astro 5, GSAP ScrollTrigger + Lenis, Canvas 2D. Deployed to GitHub Pages at `/portfolio1/` on merge to `main`.
- Reduced motion must render every chapter resolved and readable; touch devices get a non-cursor equivalent.
- Sound is opt-in and muted by default.
- Undecided: contact details, LinkedIn URL, domain, and whether a personal photo or video may be used for the face interaction.

## Brand Commitments

- Concept "Altitude": an homage to Eames' *Powers of Ten*, one ascent from pixel to country and one dive back. The dive back is required; it prevents the "higher is better" misreading.
- Hero line: "Most problems are solved at the wrong altitude."
- Return line: "And I still notice when it's 2px off."
- Pronoun shift "I" → "we" at the People chapter is a thesis statement, not decoration.
- Voice: blunt, specific, no self-congratulation. The Market chapter states belief and responsibility, never numbers.

## Evidence on Hand

- Case studies, tiered: Project Horizon (credits, lead), Super Broker (trust signals), Housing Events (event slots). Content not yet written.
- Operating notes: UX/UI Slack channel as an org-wide feedback system, competency framework, DPDP compliance work, design system / Developer Dashboard.
- Metrics: **relative numbers only** (percent changes, direction). No absolute business figures.
- Not available and must not be fabricated: testimonials, absolute metrics, client logos, specific personal ownership of design system work (to be stated precisely by Nimit), sketches or workshop artefacts until supplied.

## Product Principles

1. Make the reader experience the claim; never assert it.
2. Every effect carries exactly one meaning. Anything decorative gets cut.
3. Offer an exit from the spectacle: the 30-second version is always one click away.
4. Ownership stated precisely. Overclaiming shared work is worse than understating it.
5. Detail survives altitude: the site itself must hold pixel-level craft.

## Accessibility & Inclusion

Full experience must survive `prefers-reduced-motion`, keyboard navigation and touch input. Readers may be on low-end Android on patchy networks; the core story must load and read without the motion layer.
