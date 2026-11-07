---
name: hugorcd-design
description: "Visual codes from hugorcd.com: colours, type, spacing, surfaces and imagery. Use when designing interfaces, pages, slides, social cards, diagrams or generated images that should share Hugo Richard's visual language."
---

# Design with hugorcd.com's visual codes

Greys, one red, three typefaces, a narrow measure, hairlines instead of boxes. Use the values below in whatever tool or framework the work lives in. They set the look; the composition belongs to the work.

## Colour

Design in greys. Use the red for the few things that should be seen first: a title, a numeral, a link underline, focus, the active item. If more than a few things on a view are red, nothing is.

### Red

| Token | Value | Use |
| --- | --- | --- |
| `red` | `#CD1919` | The accent on light grounds. |
| `red-night` | `#E1342D` | The accent on dark grounds. |
| `envers` | `#901112` | Deep red. Used as a ground, or for marks and signatures on light. |
| `bone` | `#EBEBEB` | Lines and text drawn on `envers`. |
| `cartier` | `#C10016` | Dark end of the red band. |
| `ferrari` | `#DA291C` | Bright end of the red band. |
| `cartier-lifted` | `#D52729` | Dark end, for dark grounds. |
| `ferrari-lifted` | `#EE4030` | Bright end, for dark grounds. |

`red` is the midpoint of `cartier` and `ferrari` in OKLab; `red-night` is that midpoint plus 0.054 lightness. When a red needs to shift, move it along this band, never towards orange or pink. Mix colours in OKLab.

On `envers`, tint `bone` into the red rather than adding colours: 82%, 55%, 42% and 22% `bone` for ink, accent, thin and faint lines. Moving parts are `#FFFFFF`.

### Grounds and text

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `ground` | `#FFFFFF` | `#020202` | Page. |
| `ground-muted` | `#F7F7F7` | `#040404` | Quiet area. |
| `ground-elevated` | `#F3F3F3` | `#060606` | Raised area. |
| `border` | `#E4E4E4` | `#0E0E0E` | Borders. |
| `border-muted` | `#F0F0F0` | `#070707` | Fainter separations. |
| `text-highlighted` | `#171717` | `#FFFFFF` | Titles, names, links, strong text. |
| `text` | `#404040` | `#E5E5E5` | Default text. |
| `text-toned` | `#525252` | `#D4D4D4` | Slightly quieter text. |
| `text-muted` | `#737373` | `#A1A1A1` | Body text. The lightest tone for reading. |
| `text-dimmed` | `#A1A1A1` | `#737373` | Notes, captions, measurements only. |
| `code-ground` | `#F6F6F6` | `#0A0A0A` | Code. |
| `code-border` | `#E5E5E5` | `#1E1E1E` | Code edge. |

Hairlines are the text colour at low opacity: rules at 12%, dotted leaders at 22%, card borders at 10% rising to 30% on hover.

### Grounds by hour

The site's ground follows the time of day. Use one of these when a piece needs a mood other than plain white or black:

| Token | Value |
| --- | --- |
| `dawn` | `#D5DFEA` |
| `golden` | `#E8DCCA` |
| `blue-hour` | `#0C1628` |
| `dusk` | `#191125` |
| `night` | `#020202` |

On a tinted ground, keep each grey's contrast from white or black, and slide the red towards `cartier` on light grounds or towards `ferrari-lifted` on dark ones. Minimum contrast: 4.6:1 for the red, 4.5:1 for body text.

### Paper and film

Warm whites for objects that are physically paper or film, nothing else.

| Token | Value |
| --- | --- |
| `paper` | `#FBFBF9` |
| `paper-empty` | `#E6E6E3` |
| `paper-caption` | `#6F6F6C` |
| `paper-back` | `#C4C4C2` → `#F8F8F6` (dark: `#080808` → `#3C3C3C`) |
| `film` | `#F3F2EE` |
| `fog` | `#E6E4DE` |
| `photo` | `#262626` |

### Grid

On `envers`: `bone` lines every 48px at 5.5% and every 8px at 2.5%. On light: `#ECECEC` for edges, `#E2E2E2` for rules, `#CFCFCF` for ticks.

## Type

| Face | Use |
| --- | --- |
| Redaction | Titles, headings, quotes, numerals (italic). Regular and italic only, never bold. |
| Geist | Everything read. |
| Geist Mono | Labels, notes, captions, dates, measurements, code. |
| Mrs Saint Delafield | Signatures only. |

| Role | Face | Size / line | Colour |
| --- | --- | --- | --- |
| Display | Redaction | 32/40, 36/40 wide | highlighted |
| Title | Redaction | 20 | red |
| Heading | Redaction | 18, 16 | highlighted |
| Quote | Redaction italic | 32/40, 26/32 narrow | red |
| Numeral | Redaction italic | 15 | red |
| Body | Geist | 16/28 | muted |
| Strong | Geist 450 | inherit | highlighted |
| Secondary | Geist | 14 | muted |
| Value, date | Geist Mono, tabular | 12 | muted 70% |
| Label | Geist Mono, uppercase, 0.08em | 10 | muted |
| Note | Geist Mono | 10/15 | dimmed |
| Index (01, 02) | Geist Mono, tabular | 10 | muted 40% |
| Inline code | Geist Mono | 13 | highlighted on `code-ground` |

- Uppercase only on 10px mono labels.
- Tabular figures wherever numbers line up.
- Space between paragraphs, no indents. `text-wrap: pretty` for text, `balance` for titles and quotes.
- Fallbacks: Times for Redaction, Arial for Geist, Menlo for Geist Mono.

## Layout

| Token | Value |
| --- | --- |
| `measure` | 528px, the text column |
| `gutter` | 48px |
| `index` | 224px (min 144px), left margin for marks and figures |
| `note` | 176px, right margin for notes and metadata |
| `page` | 40px around the layout, 24px on mobile |
| `line` | 28px baseline |

Desktop from 1024px: index, gutter, measure, gutter, note, for a 1024px sheet. 640–1023px: margins fold into the column. Under 640px: one column. Wide blocks can break out of the measure on purpose, symmetrically, never by default.

## Surfaces

- One continuous ground. Structure comes from type, space and hairlines before boxes.
- Links: highlighted text, 1px red underline.
- Focus: 1px red line under the element, no ring. Selection: red.
- Radii: 0–2px on images and plates, 8–12px at most for a screenshot frame.
- Shadows only on physical objects (a print, a lifted page), never on floating cards.

## Motion

Still by default. Motion follows physical objects: a page lifting, a hand ticking, a pen drawing. Ease in seconds, not frames; springs settle without bouncing. No scroll reveals, parallax, marquees or pulsing. Respect reduced motion. Sound is off by default.

## Imagery

- Greys and one red. Technical subjects in `bone` line work on `envers`.
- Black-and-white photography, low directional light, natural grain.
- Technical drawings over illustration: one or two line weights, numbered parts, dimensions, a faint grid. Plans and elevations, not glossy 3D.
- Archival prints with a thin `paper` border, slight tilt, captioned.
- No glows, blobs, gradient meshes, glass, sparkles or generic 3D. A gradient only when it's a real scale, like `cartier` → `ferrari`.

## Avoid

- A second accent colour, or red as decoration.
- Centred hero followed by identical cards.
- Cards in cards, large radii, pills for metadata.
- Icons as decoration or in coloured tiles.
- Bold Redaction, Redaction for body text, mono for whole paragraphs.
- Small grey body text to make content fit.

## Tokens

```css
:root {
  --hr-red: #CD1919;
  --hr-red-night: #E1342D;
  --hr-envers: #901112;
  --hr-bone: #EBEBEB;
  --hr-cartier: #C10016;
  --hr-ferrari: #DA291C;
  --hr-cartier-lifted: #D52729;
  --hr-ferrari-lifted: #EE4030;

  --hr-ground: #FFFFFF;
  --hr-ground-muted: #F7F7F7;
  --hr-ground-elevated: #F3F3F3;
  --hr-border: #E4E4E4;
  --hr-border-muted: #F0F0F0;
  --hr-text-highlighted: #171717;
  --hr-text: #404040;
  --hr-text-toned: #525252;
  --hr-text-muted: #737373;
  --hr-text-dimmed: #A1A1A1;
  --hr-code-ground: #F6F6F6;
  --hr-code-border: #E5E5E5;

  --hr-dawn: #D5DFEA;
  --hr-golden: #E8DCCA;
  --hr-blue-hour: #0C1628;
  --hr-dusk: #191125;
  --hr-night: #020202;

  --hr-paper: #FBFBF9;
  --hr-paper-empty: #E6E6E3;
  --hr-paper-caption: #6F6F6C;
  --hr-film: #F3F2EE;
  --hr-fog: #E6E4DE;
  --hr-photo: #262626;

  --hr-font-serif: "Redaction", "Times New Roman", serif;
  --hr-font-sans: "Geist", Arial, sans-serif;
  --hr-font-mono: "Geist Mono", Menlo, ui-monospace, monospace;
  --hr-font-hand: "Mrs Saint Delafield", cursive;

  --hr-measure: 528px;
  --hr-gutter: 48px;
  --hr-index: 224px;
  --hr-note: 176px;
  --hr-page: 40px;
  --hr-line: 28px;
}

.dark {
  --hr-red: #E1342D;
  --hr-ground: #020202;
  --hr-ground-muted: #040404;
  --hr-ground-elevated: #060606;
  --hr-border: #0E0E0E;
  --hr-border-muted: #070707;
  --hr-text-highlighted: #FFFFFF;
  --hr-text: #E5E5E5;
  --hr-text-toned: #D4D4D4;
  --hr-text-muted: #A1A1A1;
  --hr-text-dimmed: #737373;
  --hr-code-ground: #0A0A0A;
  --hr-code-border: #1E1E1E;
}
```

Fonts: Geist and Geist Mono (Google Fonts, `vercel.com/font`), Redaction (`redaction.us`), Mrs Saint Delafield (Google Fonts).
