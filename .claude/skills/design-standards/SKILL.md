---
name: design-standards
description: Production-grade visual design standards and anti-AI-slop guidelines. Use whenever writing, generating, restyling, or reviewing ANY UI code, page, component, style, animation, layout, or design mockup. Also use when checking whether a user interface looks AI-generated or defaulted.
---

# Design Standards

Every UI must read as a real, production-grade product designed with restraint, precision, and clarity. Distinctiveness comes from intentional spacing, typography, and contrast — not generic decoration.

## The Core Rule: Eliminate AI Fingerprints

If a user can glance at a screen for two seconds and identify it as "AI-generated default styling", the design has failed. Distinctiveness and restraint are mandatory.

## Hard Visual Bans

Reject these patterns on sight in generation and review:
- **Default Purple/Violet/Indigo primaries** (`#7c3aed`, `#8b5cf6`, `#a855f7`, `#6366f1` and neighbours) unless intentionally defined as a strict brand requirement.
- **Purple↔blue or purple↔pink gradients** across backgrounds, buttons, or hero sections.
- **Gradient-filled headline text**.
- **Meaningless floating metric rows** (e.g. "99% satisfaction", "24/7 uptime") without real data backing.
- **Emoji-polluted headings or section labels**.
- **Generic SaaS cliches** ("Why Choose Us", "Transform your workflow").
- **Uncontrolled Glassmorphism** (heavy blur, frosted white borders, diffuse neon glows).
- **Pill-badge clutter** stacked beneath headers.
- **Single-column center-aligned layouts** from top to bottom.
- **Default system-ui / Inter** as the entire undifferentiated type hierarchy.
- **Uniform soft drop shadows** applied to every container. Shadow is an intentional elevation accent, not a background texture.

## Production Design Principles

1. **Design Tokens & Theme Consistency**:
   - Centralize colors, radii, spacing, and typography tokens (e.g., in Tailwind config, CSS variables, or design system files).
   - Use a confident neutral base (slate, zinc, neutral, or stone) paired with **one disciplined accent color** used sparingly for primary actions and highlights.

2. **Typography Hierarchy**:
   - Establish clear role differentiation: distinct display/headline font, readable body font, and monospace for tabular/numeric data and IDs.
   - Body line-height between 1.5–1.7. Headline tracking and leading tighter. Real fallbacks. Tabular figures (`tnum`) for tables and metrics.

3. **Color & Contrast**:
   - Ensure WCAG AA compliance (4.5:1 for body text, 3:1 for large headers and interactive icons).
   - Energy comes from composition, contrast, and layout balance — never from rainbow gradients.

4. **Intentional Motion**:
   - Keep animations subtle, fast (150ms–300ms), and functional (tooltips, dialog entrances, dropdown opens).
   - Always honor `prefers-reduced-motion`.

5. **Responsive & Accessible Floor**:
   - Mobile-first approach: test viewports at 375px, 768px, 1024px, and 1440px.
   - Touch targets ≥44×44px on interactive elements.
   - Visible keyboard `:focus-visible` rings, semantic HTML landmarks, alt text on images, properly labeled inputs.

## Completion Checklist

Before considering any UI task complete:
- [ ] No banned styles or AI tells present.
- [ ] Neutral base + single disciplined accent adhered to.
- [ ] Hover, focus-visible, active, and disabled states implemented.
- [ ] Responsive layout verified at mobile (375px) and desktop (1440px).
- [ ] Checked with Chanel's rule: remove one unnecessary visual element or container that isn't earning its place.

