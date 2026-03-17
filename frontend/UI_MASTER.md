# Elif UI Master File

This file is the single source of truth for UI decisions across the app.
Use it to keep design and implementation consistent for Front-Office, Back-Office, and Auth flows.

## 1. Purpose and Scope

- Define shared UI rules for all screens and components.
- Keep visual consistency across modules.
- Reduce one-off styling decisions.
- Provide a practical checklist before shipping UI changes.

In scope:

- Visual system (color, spacing, typography, radius, shadows, motion).
- Layout structure and responsive behavior.
- Reusable component behavior and states.
- Accessibility and content rules.
- Page-level composition patterns.

Out of scope:

- Backend API contracts.
- Business logic and data model decisions.

## 2. Product Areas

- Front-Office: warm, welcoming, pet-friendly.
- Back-Office: clean, efficient, data-dense.
- Auth: simple, trustworthy, focused.

## 3. Core Design Principles

- Clarity first: each screen should answer one main user goal.
- Consistency over novelty: reuse existing patterns before creating new ones.
- Progressive disclosure: show essentials first, details on demand.
- Feedback always: every user action should have visible response.
- Accessibility by default: keyboard, contrast, and readable hierarchy are mandatory.

## 4. Design Tokens

### 4.1 Brand Colors (Tailwind)

Use the existing brand palette from Tailwind config:

- brand-teal: #3A9282
- brand-orange: #F89A3F
- brand-yellow: #FBD18B
- brand-peach: #FEE8CD
- brand-red: #D64956

Usage guidance:

- Primary actions: brand-teal.
- Secondary highlight actions: brand-orange.
- Attention/warning accents: brand-yellow.
- Soft background accents: brand-peach.
- Errors/critical badges: brand-red.

### 4.2 Neutral Colors

- Background base: white / gray-50.
- Surface cards: white.
- Primary text: gray-800 or gray-900.
- Secondary text: gray-500 or gray-600.
- Borders/dividers: gray-100 or gray-200.

### 4.3 Spacing Scale

Follow Tailwind spacing steps. Prefer these values first:

- 2, 3, 4, 6, 8, 10, 12, 16

Rules:

- Section spacing: 16 to 20 vertical.
- Card internal padding: 4 to 6.
- Form field gap: 4 to 6.
- Tight text stacks: 1 to 2.

### 4.4 Radius and Shadow

- Small controls: rounded-lg.
- Cards and panels: rounded-xl.
- Hero and major surfaces: rounded-2xl only when visually justified.
- Default card shadow: shadow-sm.
- Elevated interactive card: shadow-md on hover.

### 4.5 Motion

Allowed motion:

- Fade-in and fade-in-up for section reveal.
- Slow decorative motion only for non-critical visuals.

Rules:

- Keep transitions in 200ms to 500ms range.
- No continuous motion on core task elements.
- Respect reduced motion preferences in future refinements.

## 5. Typography Rules

- Heading hierarchy should be obvious from size and weight.
- One H1 per page.
- Keep line length readable, especially in landing and settings pages.
- Use consistent title case for section headers.

Current practical scale:

- Hero H1: text-5xl or text-6xl.
- Section H2: text-3xl.
- Card title: text-lg.
- Body: text-sm or text-base.
- Caption/helper: text-xs.

## 6. Layout System

### 6.1 Front-Office Layout

- Main flow: Navbar + routed content + rich footer.
- Use container width with centered content.
- Keep landing sections with clear visual rhythm and alternating backgrounds.

### 6.2 Back-Office Layout

- Main flow: Sidebar + topbar + content canvas.
- Prioritize information density and quick scanning.
- Keep key actions visible near data modules.

### 6.3 Auth Layout

- Single-column centered card on soft decorative background.
- Keep form interaction fast and distraction-free.

### 6.4 Responsive Behavior

- Mobile first.
- Collapse non-essential side content first.
- Preserve primary action visibility on all breakpoints.
- Ensure tap targets are comfortably sized.

## 7. Component Standards

## 7.1 Buttons

Variants:

- Primary: filled brand-teal, white text.
- Secondary: neutral border, dark text.
- Danger: red-tinted style for destructive actions.

States required:

- Default
- Hover
- Focus visible
- Disabled
- Loading (when async)

Rules:

- Use one primary button per action group.
- Keep labels action-first: "Save Changes", "Create Appointment".

## 7.2 Cards

- Use as default container for grouped information.
- Header should contain title and optional actions.
- Keep visual weight light unless card is selected or critical.

## 7.3 Forms

- Label above input.
- Show helper text only when useful.
- Error text should be specific and actionable.
- Preserve consistent field spacing and control heights.

## 7.4 Navigation

- Navbar for Front-Office global routes.
- Sidebar for Back-Office functional navigation.
- Active states must be visually clear.
- Avoid dead links in production pages.

## 7.5 Tables and Lists (Back-Office)

- Use clear column labels and action grouping.
- Include empty states for no data.
- Reserve bold text for high-priority values.

## 8. Interaction and Feedback

- Loading: skeletons or subtle placeholders for data-heavy views.
- Success: inline confirmations or toast pattern.
- Error: readable message plus next action.
- Empty: explain why empty and what user can do next.

## 9. Accessibility Baseline

Minimum requirements for every UI change:

- Logical heading order.
- Keyboard reachable controls.
- Focus indication on interactive elements.
- Alt text for meaningful images.
- Decorative images marked as hidden from assistive tech.
- Maintain readable contrast.

## 10. Page Blueprint Checklist

Apply this checklist when creating or updating any page:

1. Define page goal in one sentence.
2. Confirm layout type (Front-Office, Back-Office, Auth).
3. Reuse existing shared components first.
4. Apply token-compliant colors and spacing.
5. Add all required component states.
6. Verify responsive behavior on mobile and desktop.
7. Verify accessibility baseline.
8. Validate with realistic content length.

## 11. Current Page Inventory

Front-Office:

- Landing
- Dashboard
- Pet Profiles
- Medical Records
- Services
- Messages

Back-Office:

- Dashboard
- Appointment Management
- Patient Database
- Clinical Records
- Clinic Management
- Billing

Auth:

- Login
- Register

## 12. Definition of Done for UI

A page is done only if:

- It follows this master file.
- It reuses shared components where applicable.
- It has complete interaction states.
- It is responsive and accessible.
- It avoids placeholder-only interactions for core workflows.

## 13. Change Management

When updating UI rules:

1. Update this file first.
2. Mention affected modules/components.
3. Keep updates incremental and documented.
4. If rule conflicts exist, this file takes priority.

## 14. Next Implementation Priorities

- Connect Auth screens to real form validation and submission states.
- Add shared feedback patterns (loading, success, error, empty).
- Standardize button variants and focus states across modules.
- Replace placeholder links/actions with routed or disabled-intent states.
