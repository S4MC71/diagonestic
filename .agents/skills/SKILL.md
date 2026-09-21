---
name: website-cloner
description: Reconstruct an authorized public website frontend as faithfully as possible. Use browser inspection, route discovery, DOM/CSS analysis, asset and font inventory, interaction/state discovery, responsive testing, and repeated original-vs-clone verification. Never treat the homepage alone as the scope.
---

# Website Cloner

## Mission

Reconstruct the frontend of the target website with the highest practical fidelity.

The target website is the source of truth for:
- structure
- routes
- content visible to the public
- typography
- spacing
- colors
- borders
- shadows
- imagery
- icons
- responsive behavior
- animations
- transitions
- interactive UI states

The goal is not to make a page that merely looks similar. The goal is to reproduce the discovered public frontend surface comprehensively.

Do not declare success merely because the application builds or the homepage looks good.

---

## 0. Scope and boundaries

Only inspect and reproduce websites/pages that the user is authorized to reproduce.

This skill focuses on frontend reconstruction. Do not attempt to bypass:
- authentication
- paywalls
- CAPTCHA
- access controls
- bot protections
- private APIs
- rate limits
- security controls

If content is unavailable without authorization, record it as unavailable rather than attempting to bypass the restriction.

Do not copy secrets, credentials, private user data, API keys, session tokens, or other sensitive information.

---

# 1. Mandatory workflow

Always follow this lifecycle:

```text
DISCOVER
  ↓
INVENTORY
  ↓
INSPECT
  ↓
IMPLEMENT
  ↓
RUN
  ↓
VERIFY
  ↓
COMPARE
  ↓
FIX
  ↓
RE-VERIFY
```

Do not skip directly from URL → implementation.

For multi-page websites, discovery must happen before significant implementation.

---

# 2. Phase 1 — Target reconnaissance

Start by opening the target URL in a real browser environment.

Preferred browser hierarchy:

1. `ego-browser` if available and compatible with this skill.
2. Antigravity's native browser capabilities.
3. Playwright/browser automation available in the project.
4. Other available browser inspection tooling.

Never assume a browser runtime exists. Check first.

For `ego-browser`, prefer its documented `nodejs` interface and task-space workflow.

Record:

```text
target_url
site_title
detected_framework
detected_cms
detected_hosting
language
viewport_behavior
```

Do not spend the first pass implementing UI.

---

# 3. Phase 2 — Complete route discovery

The homepage is NOT the scope.

Discover routes from all available public sources:

- primary navigation
- secondary navigation
- footer
- sitemap.xml
- robots.txt when useful
- canonical links
- internal anchor links
- cards
- CTA links
- buttons that navigate
- pagination
- breadcrumbs
- blog/article indexes
- category pages
- search results where publicly accessible
- alternate language links
- mobile navigation
- menus and dropdowns
- visible route references in page source/DOM
- public links discovered during interaction testing

Normalize URLs.

Remove:
- duplicate URLs
- tracking parameters when they do not change content
- external domains unless explicitly part of the requested frontend
- obvious non-page resources

Create a route inventory before implementation.

Example:

```json
{
  "routes": [
    {
      "url": "/",
      "type": "homepage",
      "status": "discovered"
    },
    {
      "url": "/about",
      "type": "content",
      "status": "discovered"
    }
  ]
}
```

For every discovered route record:

- URL
- page type
- source of discovery
- HTTP status when available
- whether it is publicly accessible
- important shared components
- unique components
- interaction requirements

Do not silently discard routes.

---

# 4. Phase 3 — Component inventory

For every important page, identify:

## Global components

- announcement bars
- headers
- logos
- navigation
- mega menus
- mobile navigation
- search UI
- account UI
- breadcrumbs
- footer
- cookie/consent UI when visible
- floating controls

## Content components

- hero sections
- cards
- grids
- lists
- pricing tables
- feature sections
- testimonials
- statistics
- galleries
- article blocks
- FAQ sections
- forms
- CTAs

## Interactive components

- buttons
- links
- dropdowns
- select controls
- tabs
- accordions
- modals
- drawers
- carousels
- sliders
- pagination
- tooltips
- hover menus
- expandable sections
- sticky controls
- filters
- sorting controls
- search controls

For each component record:

```text
name
location
visual structure
interaction
states
responsive behavior
assets
```

---

# 5. Phase 4 — DOM and layout inspection

Inspect the rendered DOM, not just screenshots.

Determine:

- semantic structure
- major containers
- nesting
- repeated component patterns
- class naming patterns
- layout primitives
- CSS grid/flex usage where observable
- fixed/sticky elements
- max-width containers
- spacing system
- breakpoints
- aspect ratios
- image sizing/cropping
- z-index relationships

Prefer reusable React/Next.js components instead of duplicating page markup.

Do not reproduce meaningless implementation details solely because they exist in the DOM. Reproduce the resulting frontend behavior and appearance.

---

# 6. Phase 5 — Visual design extraction

Extract or infer from rendered styles:

## Typography

- font family
- font source
- font weights
- font sizes
- line heights
- letter spacing
- text transformations

## Colors

Record meaningful tokens:

```text
background
surface
primary
secondary
accent
text
muted text
border
hover
active
focus
```

## Geometry

Record:

- container widths
- section spacing
- gaps
- padding
- margins
- border radius
- border widths
- shadows
- image dimensions
- button dimensions

Prefer centralized design tokens where practical.

Example:

```css
:root {
  --color-primary: ...;
  --color-text: ...;
  --radius-card: ...;
  --container-width: ...;
}
```

Do not invent a new design system when the original design system can be reproduced.

---

# 7. Phase 6 — Asset inventory

Identify public frontend assets:

- PNG
- JPG/JPEG
- WebP
- AVIF
- SVG
- logos
- icons
- illustrations
- background images
- video thumbnails
- fonts
- publicly accessible animation assets

For every important asset record:

```text
source URL
local filename
type
dimensions
where used
```

Prefer the original asset when it is publicly available and authorized for the reconstruction.

Do not replace a recognizable asset with a random placeholder merely to finish faster.

If an asset cannot be retrieved, record the reason and use the closest structurally appropriate fallback.

---

# 8. Phase 7 — Interaction/state discovery

Do not inspect only the default state.

Test relevant interactive controls.

For each:

```text
element
default state
hover state
focus state
active state
expanded state
disabled state
loading state
error state
success state
```

where applicable.

Examples:

### Navigation

- desktop navigation
- mobile navigation
- dropdown
- mega menu
- nested menu
- active route

### Buttons

- hover
- active
- focus
- disabled
- navigation behavior

### Forms

- empty
- focused
- invalid
- valid
- loading
- submitted state when publicly testable

### Components

- tabs
- accordions
- modal
- drawer
- carousel
- filters
- pagination

Do not claim an interaction is reproduced until it has been tested locally.

---

# 9. Phase 8 — Responsive analysis

At minimum inspect:

```text
Desktop
Tablet
Mobile
```

Use representative widths such as:

```text
1440
1024
768
390
```

Adjust these if the original site clearly uses different breakpoints.

For each viewport compare:

- navigation
- container width
- typography
- spacing
- image cropping
- columns
- stacking
- visibility
- mobile-only controls
- desktop-only controls
- overflow
- sticky/fixed behavior

Do not simply scale the desktop layout down.

Reproduce actual responsive behavior.

---

# 10. Phase 9 — Framework-aware implementation

Before implementation, identify the likely frontend architecture.

Possible cases:

```text
Static HTML
React
Next.js
Vue
Nuxt
Remix
Webflow
Framer
Other
```

Choose an implementation strategy appropriate to the project.

For a new React/Next.js reconstruction:

- use reusable components
- avoid giant monolithic page files
- keep route-specific data separate from shared UI
- preserve responsive behavior
- preserve interaction states
- avoid unnecessary dependencies
- keep the project buildable

If the existing project already has a framework, work with it instead of unnecessarily replacing the stack.

---

# 11. Route implementation rules

Every discovered route must be represented in the implementation.

Maintain a route checklist:

```text
[ ] /
[ ] /about
[ ] /services
[ ] /pricing
[ ] /contact
```

Do not mark a route complete merely because navigation reaches it.

A route is complete only when:

```text
route exists
+
layout is implemented
+
content structure is implemented
+
assets are implemented
+
responsive behavior is implemented
+
important interactions are implemented
+
local browser verification passes
```

---

# 12. Shared component rules

If several pages use the same:

- header
- footer
- button
- card
- navigation
- modal
- typography
- section pattern

create reusable components.

Do not duplicate them page-by-page unless the original genuinely behaves differently.

Example:

```text
components/
├── Header
├── Footer
├── Button
├── Card
├── Modal
└── Navigation
```

Use page-specific components only where appropriate.

---

# 13. Content fidelity

Preserve the visible structure and content of the target as closely as possible.

Do not:

- summarize large sections
- remove secondary text
- replace sections with placeholders
- collapse repeated cards into one example
- remove footer content
- remove legal/navigation links
- remove visible metadata
- invent major sections

If dynamic data cannot be reproduced, create a clearly structured local/static representation that preserves the frontend layout and states.

---

# 14. Animation and transition analysis

Inspect:

- CSS transitions
- CSS keyframes
- hover transitions
- fade/slide effects
- entrance animations
- scroll-triggered effects
- sticky behavior
- parallax-like behavior
- carousel movement

Reproduce meaningful visual motion.

Do not introduce animations that are not present in the original simply to make the clone look more impressive.

If exact timing cannot be determined, approximate only after inspecting the original behavior.

---

# 15. Browser verification

After implementation:

1. Start the local application.
2. Open the local URL in a browser.
3. Visit every discovered route.
4. Test important interactions.
5. Test desktop and mobile.
6. Capture screenshots of representative pages.
7. Compare against the original.

Do not stop at:

```text
npm run build
```

A successful build does not mean a successful clone.

---

# 16. Original vs clone comparison

For each important page compare:

## Structure

- section order
- missing sections
- container widths
- alignment
- element positions

## Typography

- font family
- font weight
- size
- line height
- wrapping

## Visuals

- colors
- backgrounds
- borders
- radius
- shadows
- images
- icons

## Spacing

- section gaps
- padding
- card gaps
- button spacing

## Behavior

- navigation
- dropdowns
- modals
- tabs
- forms
- responsive behavior
- animations

Prioritize actual discrepancies over subjective redesign.

---

# 17. Missing-element audit

Before completion run a specific missing-element audit.

Ask:

```text
Are any original routes missing?

Are any navigation links missing?

Are any footer links missing?

Are any buttons missing?

Are any sections missing?

Are any cards missing?

Are any images missing?

Are any icons missing?

Are any forms missing?

Are any interactive states missing?

Are any mobile-only elements missing?

Are any desktop-only elements missing?

Are any animations missing?
```

If any answer is yes, continue implementation.

---

# 18. Visual-diff iteration

Use this loop:

```text
Original screenshot
       ↓
Clone screenshot
       ↓
Compare
       ↓
Identify differences
       ↓
Fix highest-impact difference
       ↓
Re-render
       ↓
Compare again
```

Fix in this order:

1. missing sections
2. wrong layout/geometry
3. wrong responsive behavior
4. wrong typography
5. wrong images/assets
6. wrong colors
7. wrong spacing
8. missing interactions
9. animations/transitions
10. small pixel-level differences

Do not spend time tuning shadows while an entire section is missing.

---

# 19. Evaluation

If the project provides an evaluation script, use it.

If available, compare:

```text
geometry
typography
color
assets
fonts
animations
content/layout completeness
visual similarity
```

Store evaluation output in a dedicated directory such as:

```text
eval-out/
```

After each meaningful correction:

```text
run evaluation
→ inspect failures
→ fix
→ run evaluation again
```

Do not optimize for a numerical score at the expense of actual route/component completeness.

---

# 20. Completion criteria

The task is complete only when all of the following are true:

```text
[ ] Target was fully crawled within allowed scope
[ ] Route inventory exists
[ ] All important public routes are implemented
[ ] Navigation is implemented
[ ] Footer is implemented
[ ] Shared components are implemented
[ ] Unique page sections are implemented
[ ] Assets are handled
[ ] Fonts are handled
[ ] Important interactions are implemented
[ ] Responsive behavior is implemented
[ ] Important animations are implemented
[ ] Local application builds
[ ] Local application runs
[ ] Every route was browser-tested
[ ] Desktop was tested
[ ] Mobile was tested
[ ] Missing-element audit was performed
[ ] Original-vs-clone comparison was performed
[ ] Significant discrepancies were fixed
[ ] Final verification was performed
```

Never say "complete" if major discovered items remain unimplemented.

---

# 21. Failure handling

If a route fails:

```text
record route
record failure
continue with remaining routes
return to failed route later
```

If an asset fails:

```text
record asset
record source/failure
try an authorized alternative retrieval path
otherwise use a structurally appropriate fallback
```

If an interaction cannot be reproduced exactly:

```text
document the limitation
preserve the visible UI
preserve the closest observable behavior
do not invent unrelated behavior
```

If the target is inaccessible:

```text
stop active inspection of the inaccessible resource
do not bypass its access controls
report the limitation
```

---

# 22. Anti-shortcut rules

The following are prohibited within this workflow:

```text
DO NOT:
- clone only the homepage
- stop after a successful build
- invent routes instead of discovering them
- remove difficult sections
- replace complex components with placeholders
- skip mobile
- skip interactions
- skip footer/navigation
- ignore secondary pages
- use screenshots as the only source of truth
- declare success without browser verification
```

When uncertain whether something matters, inspect it before omitting it.

---

# 23. Recommended project artifacts

Keep a small audit directory:

```text
.cloner/
├── routes.json
├── components.json
├── assets.json
├── interactions.json
├── responsive.json
├── screenshots/
│   ├── original/
│   └── clone/
└── reports/
```

These artifacts make omissions easier to detect.

---

# 24. Agent behavior

Work autonomously through the workflow where possible.

Do not repeatedly ask the user to confirm routine implementation decisions.

Ask the user only when a decision materially affects scope, authorization, target selection, or a requirement that cannot be inferred safely.

When the user says "clone this website", interpret the task as:

```text
full public frontend reconstruction
```

not:

```text
homepage mockup
```

---

# 25. Final response format

When the work is actually complete, summarize:

```text
Routes discovered: X
Routes implemented: Y
Major components: X
Interactive components tested: X
Responsive viewports tested: X
Evaluation performed: yes/no
Known limitations: ...
```

If anything remains incomplete, explicitly list it.

Never hide incomplete work behind a claim of completion.
