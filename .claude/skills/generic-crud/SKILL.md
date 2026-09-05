---
name: generic-crud
description: Guide for wiring an entity into full-featured CRUD, DataTable, and form patterns with robust state handling. Use whenever building list, create, edit, delete, or detail views for ANY entity — including requests like "a page to manage X", "let users add Y", or "show all the Zs". Also use when establishing loading, empty, and error states.
---

# Generic CRUD Architecture

Standardizing entity management avoids bespoke bugs and speeds up development across any project.

## Reference Entity Pattern

Adopt a clean, modular structure per entity or domain feature (adapt path to project convention, e.g. `src/features/<entity>`, `src/modules/<entity>`, or `app/<entity>`):

```
features/<entity>/
├── columns.tsx        # Table column definitions, formatters, actions
├── schema.ts          # Input & validation schema (Zod/Pydantic), shared across API & UI
├── hooks.ts           # Query hooks & mutations (TanStack Query, SWR, or RTK)
├── form.tsx           # Form component with client validation (RHF, etc.)
└── components/        # Entity-specific subcomponents & dialogs
```

If the project already has an existing reference entity (e.g. `features/_template` or an existing working resource), inspect and mirror its conventions.

## Core Rules

1. **Leverage Shared Table Primitives**: Use the project's `<DataTable>` or table component with column definitions. Standardize sorting, filtering, and pagination rather than creating one-off table implementations.

2. **Single Source of Truth for Schemas**: Maintain unified schemas (e.g., `schema.ts`) shared between API validation and client-side form validation to prevent schema drift.

3. **Coordinated Cache Invalidation**: All mutations must invalidate or update the entity's cache key upon success, ensuring list and detail views stay in sync without requiring manual page reloads.

4. **All Five UI States Required**: Every data-driven screen must implement:
   - **Loading Skeleton**: Layout-preserving placeholder while fetching.
   - **Empty State**: Clear message and call-to-action when zero records exist.
   - **Error State**: Actionable recovery message when requests fail.
   - **Success Feedback**: Toast or notification on successful mutations.
   - **Status Indicators**: Badges or chips for record states/statuses.

5. **Additive & Isolated Additions**: Adding a new entity should not break or require extensive edits to existing domain modules. Keep entity definitions modular.

## API Endpoint Standard

Standardize RESTful or RPC structure per resource (e.g., `GET /api/<entity>`, `POST /api/<entity>`, `GET /api/<entity>/:id`, `PATCH /api/<entity>/:id`, `DELETE /api/<entity>/:id`).
- Check authorization / permissions before mutating or reading sensitive data.
- Audit/log state-changing actions where applicable.

## Verification Checklist

Before considering an entity implementation complete:
- [ ] Create, Read, Update, Delete flows verified.
- [ ] Edge cases handled (empty inputs, network errors, invalid IDs).
- [ ] Permission / role checks verified at both the API and UI layers.
- [ ] All 5 states (loading, empty, error, success, status) render properly.
- [ ] Responsive layout verified across mobile and desktop viewports.

