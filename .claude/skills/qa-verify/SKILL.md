---
name: qa-verify
description: The quality assurance and verification contract for multi-agent or developer workflows. Use whenever a feature, task, slice, or bugfix is about to be marked as done; before opening PRs; and whenever the user asks "test", "verify", "check", "is it working", or "done".
---

# QA & Verification

Nothing is considered complete until it has been rigorously verified against real execution, edge cases, and permissions. Compiling or typechecking is only the baseline, not the proof.

## Builder Self-Verification (Before Handoff)

Run the project's verification commands (adapt package manager and scripts to the repository):

```bash
npm run typecheck && npm run lint && npm test
```

Confirm runtime behavior: run the local dev server or app and exercise the change manually or with an automation tool. Untested code must never be handed off as "done".

## QA Verification Standards

Independent verification should evaluate:

1. **Requirement Alignment**: Does this change satisfy the actual requirements without side-effects or regressions?
2. **Happy Path**: Execute the primary user or API flow from start to finish.
3. **Edge & Failure Cases**: Verify boundary inputs, null/empty states, malformed payloads, and network failures.
4. **Authorization & Security Negative Testing**:
   - Confirm unauthenticated or unauthorized roles are blocked **at the API / data layer**, not merely by hiding UI buttons.
   - Test against rate limits, input sanitization, and sensitive data leakage.
5. **UI States (where applicable)**:
   - Loading skeleton, empty state, error state, success feedback, and status indicators.
6. **Responsive Layouts & Accessibility**:
   - Verify layout on mobile (375px) and desktop (1440px). Ensure keyboard navigation and screen-reader accessibility.
7. **Code & Security Hygiene**:
   - No hardcoded secrets, no leftover console logs, no bypasses.

## Universal QA Report Format

```
ROLE:     <Builder | QA | Reviewer>
SCOPE:    <Feature / Module / Bug ID>
STATUS:   <PASSED | BLOCKED | NEEDS_REVISION>
DONE:     <Summary of completed changes>
TESTED:   <Evidence: test commands run, edge cases exercised, security checks, viewports checked>
BLOCKERS: <Details on any missing credentials, external dependencies, or unconfigured APIs>
NEXT:     <Next recommended action>
```

