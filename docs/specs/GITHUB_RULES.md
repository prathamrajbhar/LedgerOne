# GitHub & Git Branch Workflow Rules

This document outlines the multi-branch development rules and workflow for the 4 parallel developer tracks on LedgerOne: **backend1**, **backend2**, **frontend1**, and **frontend2**.

---

## 1. Branch Strategy & Architecture

### Base Branches
- `main` — Production-ready, stable codebase. Direct pushes to `main` are strictly prohibited.

### 4 Core Tracks & Ownership

| Track | Base / Working Branch | Prefix for Feature Branches | Scope & Task Reference Document |
|---|---|---|---|
| **Backend 1** | `backend1` | `backend1/<task-name>` | Master Data, Purchase Cycle, Expense, Accounting & Reports ([1_BACKEND.md](file:///home/pratham/Disk1/Odoo_Workspace/LedgerOne/1_BACKEND.md)) |
| **Backend 2** | `backend2` | `backend2/<task-name>` | Sales Cycle, Razorpay Integration, Budgeting, Chatbot & Webhooks ([2_BACKEND.md](file:///home/pratham/Disk1/Odoo_Workspace/LedgerOne/2_BACKEND.md)) |
| **Frontend 1** | `frontend1` | `frontend1/<task-name>` | UI Foundation, Master Data Pages, Purchase Cycle UI ([1_FRONTEND.md](file:///home/pratham/Disk1/Odoo_Workspace/LedgerOne/1_FRONTEND.md)) |
| **Frontend 2** | `frontend2` | `frontend2/<task-name>` | Layout/Dashboard, Sales Cycle UI, Budgets, Reports & Portal ([2_FRONTEND.md](file:///home/pratham/Disk1/Odoo_Workspace/LedgerOne/2_FRONTEND.md)) |

---

## 2. Mandatory Rules for Developers

### ⚠️ Rule 1: One Task → One Commit → One PR
- Never batch multiple tasks into one branch or PR.
- Complete task $N$, run checks, commit, open PR, get it reviewed/merged before starting task $N+1$.

### ⚠️ Rule 2: Strict Branch Naming Convention
Feature branches must be prefixed with the assigned track name:
- **Backend 1:** `backend1/product-service`, `backend1/chart-of-accounts-service`
- **Backend 2:** `backend2/sales-order-service`, `backend2/razorpay-integration`
- **Frontend 1:** `frontend1/shadcn-setup`, `frontend1/contacts-list`
- **Frontend 2:** `frontend2/purchase-orders-list`, `frontend2/sales-invoices`

### ⚠️ Rule 3: Pre-Commit & Pre-PR Verification
Before pushing and creating any PR, every developer MUST verify locally:
```bash
# Backend verification:
npm run lint && npm run type-check && npm run test

# Frontend verification:
npm run lint && npm run type-check
```
PRs with failing lint, type errors, or broken tests will be blocked from merging.

### ⚠️ Rule 4: Sync Frequently with Base
To prevent large merge conflicts across tracks:
1. Rebase or pull updates from `main` or your parent track branch daily:
   ```bash
   git fetch origin
   git rebase origin/main
   # or git merge origin/main
   ```
2. Resolve conflicts locally and re-test before requesting review.

---

## 3. Pull Request (PR) & Code Review Guidelines

1. **Target Branch:**
   - Feature branches merge into their corresponding track branch (`backend1`, `backend2`, `frontend1`, `frontend2`) or directly into `main` according to the team lead's integration cycle.
2. **PR Title Format:**
   Must follow Conventional Commits: `<type>(<scope>): <short description>`
   - Example: `feat(products): implement product management service`
   - Example: `feat(ui): add customer invoice list and detail view`
3. **PR Description Requirements:**
   - Reference the corresponding task from `1_BACKEND.md`, `2_BACKEND.md`, `1_FRONTEND.md`, or `2_FRONTEND.md`.
   - Include brief summary of changes.
   - Attach verification proof (terminal output of tests/type-checks, or screenshots for UI).
4. **Approval Requirement:**
   - At least 1 review approval is required before merge.
   - All CI checks must pass.

---

## 4. Conventional Commit Standards

Every commit must follow this format:
```
<type>(<scope>): <subject>

<body>
```

### Types:
- `feat`: New feature or service endpoint
- `fix`: Bug fix
- `refactor`: Code refactoring without behavioral changes
- `test`: Adding or modifying tests
- `chore`: Tooling, build config, or dependency changes
- `docs`: Documentation updates
- `style`: Formatting, whitespace, linting

### Scopes:
- `auth`, `contacts`, `products`, `accounts`, `journals`, `analytics`, `purchase`, `sales`, `payments`, `accounting`, `budgeting`, `reporting`, `portal`, `chatbot`, `settings`, `ui`, `db`, `config`
