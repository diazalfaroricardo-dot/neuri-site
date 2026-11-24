---
name: neuri.tech
surface: home (/ en, /es/ es)
version: v12 · live 2026-11-23 (commit d38ff81)
---

# Neuri — design system (neuri.tech)

**Thesis.** The home is one day of your business, shown as a precise 24-hour instrument that the agents fill while you live. Calm, exact, light; one authored motion moment per section, never stacked effects.

Craft bar named by Ricardo: Linear / Vercel (precision, fine type, air, subtle motion). Rejected looks: "de juguete", "chunky", dark-everywhere, mono eyebrows, section numbers, cards in cards, gradient text, tilt cards, particle effects stuck together.

## Color

Strategy: **Restrained light** — wall neutral ground, white instrument panels, one ink, one brand green; product colours only as small lane dots. Night is the one dark exception (the close), because the story ends at night.

| Token | Value | Use |
|---|---|---|
| `--wall` | `#F6F4EE` | page ground |
| `--panel` | `#FFFFFF` | instruments, cards, chat, ticket |
| `--line` | `#E4E2DB` | 1px hairlines, panel borders |
| `--line2` | `#EDEBE5` | inner dividers |
| `--night` | `#EFEDE6` | night hours in the day plot |
| `--ink` | `#05080D` | text, primary button, close background |
| `--ink2` | `#3D423E` | body text |
| `--sub` | `#6A6F69` | secondary text (≥4.5:1 on wall) |
| `--faint` | `#696E67` | hour labels, notes |
| display grey | `#80857F` | second half of display headlines only (large text, ≥3:1) |
| `--green` | `#0B5E3A` | brand accent, outgoing chat bubble, focus ring |
| `--mint` | `#8FE0B4` | night accents, close CTA |
| `--blush` | `#E3EFE7` | 11:00 story band |
| peach | `#FCE9DC` | dawn story band, hero sky |
| `--bots` | `#0B5E3A` | lane dot |
| `--bazar` | `#B4441A` (`#A63E17` behind text) | lane dot / post tile |
| `--consulting` | `#1F7A52` | lane dot, score bars |
| `--marketing` | `#C2341D` | lane dot |
| selection | `#CFE7D9` | `::selection` |

Rules: no gradients on text or UI; the only gradients are ambient light (hero sky, night glow). Never more than one product colour per element.

## Type

Geist (self-hosted, `assets/fonts/geist-latin-wght.woff2`), Geist Mono only for clock times, money and figures (tabular).

| Role | Size | Weight | Tracking | Line |
|---|---|---|---|---|
| Hero h1 | clamp(44px, 6.4vw, 88px) | 500 | -0.045em | 1.02 |
| Story clock | clamp(80px, 11vw, 160px) | 500, tabular-nums | -0.055em | 1 |
| Section h2 | clamp(32px, 3.6vw, 48px) | 500 | -0.035em | 1.06 |
| Brand h2 / close h2 | clamp(34–40px … 60–68px) | 500 | -0.04 to -0.045em | 1.02–1.06 |
| Chapter h3 | clamp(26px, 2.6vw, 38px) | 500 | -0.035em | 1.12 |
| Product name | 26px | 500 | -0.03em | — |
| Body | 16px (lead 17–18px) | 400 | 0 | 1.6 |
| Small / captions | 12–14px | 400–500 | 0 | 1.35–1.5 |

Max weight 500 on the page (brand max 600). No uppercase tracked labels.

## Space and shape

Container 1200px, side padding 32px (20px ≤760px). Sections start 160px apart (112px mobile); the close 200px. Radii: buttons 999px, panels 18–22px, inner chips 10px, ticket 6px with punched edges. Shadows: soft and offset only, e.g. `0 40px 80px -60px rgba(5,8,13,.28)`; no zero-offset halos.

## Components

- **Nav:** sticky, wall at 95% + blur, hairline after scroll; sans 14px links `#585D57`; «Talk to Neuri» is a `.tl` text link (no pill: one primary button per section, Ricardo 24-nov).
- **Buttons:** `.btn.p` ink pill (mint on night), `.btn.g` white with hairline; 40px tall, 14px/500. One `.btn.p` per section; secondary actions are `.tl` text links (green underline, wall on night, 44px touch target).
- **Day instrument (hero):** white panel; header (title + "sample data" label + lane legend), plot (hour lines every 3 h, night shading 00–07 and 21–24, 4 lanes, event pins with tag cards), footer counters. Mobile: becomes a time-ordered list.
- **Story (pinned):** clock left, chapter copy, artifact right (posts, chat, ticket, AI Score, end-of-day count); background walks peach → wall → white → blush → ink. Mobile / reduced motion: chapters stacked with their artifact.
- **Product rows:** hairline rows; name with lane dot + status, copy + link, facts `dl`, real phone screenshot (`figure.shot`, not a link, with `p.src` data note); the card's only link is `a.more`.
- **Numbers band:** 4 big numerals with hairline dividers (only true facts).
- **Close (night):** ink background, mint glow, 3,000-dot canvas that swarms and writes `hello` / `hola`; CTAs: one mint button «Book a 30-min demo» (Calendly `diazalfaroricardo/30min`) + text link to hola@neuri.tech. Hero: one button «See the products» + text link «or write to us».

## Motion

One authored moment per surface region, exponential ease-out, content visible by default:
1. Hero: cursor sweeps 00→24 h once (6.4 s), events land as it passes, then rests at Phoenix time; sky tint follows the hour; counters rise.
2. Story: ScrollTrigger pin + scrub; artifacts stagger in (expo.out, 0.09 s).
3. Close: canvas swarm cycle (chaos 3.2 s → form 7.5 s → burst 1.6 s), pointer repels; 60 fps.
`prefers-reduced-motion`: no sweep, no pin, static word.

## Honesty and copy rules (locked by tests)

Sample data is always labelled ("ejemplo con datos inventados" / "sample with made-up data"). neuri.bots says sign-up open and that it already replies on Instagram, Facebook and WhatsApp (TikTok and SMS soon). Consulting: free AI Score, fixed price per stage, "a person reviews it if something doesn't add up". D-10: English at `/`, Spanish at `/es/`, USD, no Mexico references. "We reply within 1 business day" sits next to the email link.

## Files

`index.html` (en), `es/index.html` (es), `assets/dia.js` (day + story + sky), `assets/hola.js` (close swarm), GSAP + ScrollTrigger in `assets/gsap/`. Direction contract: `.impeccable/surfaces/index-html.md`. Tokens: `.impeccable/design.json`.
