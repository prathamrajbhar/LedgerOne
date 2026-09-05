---
name: reviewer-doc
description: Maintains an Architecture Decision & Reviewer Prep log (e.g. docs/architecture-decisions.md or docs/reviewer-prep.md) to record trade-offs, rationale, and scalability answers. Use whenever completing a feature slice, making an architectural trade-off, or preparing for code reviews, stakeholder demos, or technical handovers.
---

# Architecture Decisions & Reviewer Prep

Documenting decisions as they happen preserves the critical "why" behind an architecture. Incomplete documentation leads to forgotten trade-offs during code reviews, audits, and demos.

## Core Rules

1. **Document Rationale Concurrently**:
   - Record decisions as features are implemented, not weeks later.
   - For every major architectural decision, capture:
     - **Context & Problem**: What requirement or constraint drove this choice?
     - **Alternative Approaches Rejected**: What did you consider and decide *not* to use, and why?
     - **Trade-offs Accepted**: What are the trade-offs (e.g., development speed vs. cold starts, complexity vs. flexibility)?
     - **Future Evolution**: How will this scale or evolve under higher load or new requirements?

2. **Format as Clear, Spoken Explanations**:
   - Write entries so they can be spoken directly in a design review or demo:
     - *"We chose a normalized PostgreSQL schema over a document store because invoice consistency and financial reporting require relational transactions, accepting slightly more complex migrations."*

3. **High-Value Questions to Anticipate**:
   - **Why this specific tech stack / library?** (Highlight specific capabilities, team ergonomics, or deployment fit over buzzwords).
   - **How does security & access control work?** (Point to the centralized permission model and API enforcement layer).
   - **How does this system scale?** (Database connection pooling, indexing strategies, cache invalidation, asynchronous background jobs).
   - **What would be prioritized next with more time?** (Have 2–3 concrete roadmap items ready).

## Recommended Structure

Create or maintain an ADR or technical guide (e.g., `docs/architecture-decisions.md`):

```markdown
### [Decision / Component Name]
- **What it does**: Brief functional summary.
- **Why this design**: Key rationale and alternatives evaluated.
- **Trade-off taken**: Conscious compromise accepted.
- **Next steps**: What would be improved in future iterations.
```

