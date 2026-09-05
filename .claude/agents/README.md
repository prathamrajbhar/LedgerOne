# Code Correctness Agent Team (Auditor, Builder, QA-Reviewer, Tester)

A multi-agent pipeline designed to eliminate hardcoded values, mock data, simulated API calls, and incomplete integrations from any project codebase.

## Setup

You can use these agents either on a per-project basis or globally.

### Option 1: Per-Project Installation
Copy the `.md` agent files into your project's agent configuration directory:
- **Claude Code**: `<your-project>/.claude/agents/`
- **Antigravity / Generic Agent Frameworks**: `<your-project>/.agents/` or `<your-project>/agents/`

```bash
mkdir -p your-project/.claude/agents/
cp agents/*.md your-project/.claude/agents/
```

### Option 2: Global Configuration
Copy the agent definitions to your user-level configuration (e.g. `~/.claude/agents/` or `~/.gemini/config/agents/`) so that all projects on your machine have access to them.

Restart your agent session in the project so the newly added agent files are loaded.

---

## Running the Pipeline

These agents operate in a sequence to ensure verified, high-quality migrations from mock code to production implementations:

### Phase 1: Audit
Run the Auditor to scan the codebase without making modifications:
```
Use the auditor agent to scan this codebase and produce the hardcoded/mock/placeholder report.
```
*Note: For large codebases, scope the scan to a specific feature or directory (e.g., `features/billing/` or `src/modules/auth/`).*

### Phase 2: Build
Review the Auditor's checklist, then invoke the Builder to implement real logic for specific items:
```
Use the builder agent to fix the first 3 items in the auditor's report, one at a time.
Stop and ask me if any item requires real credentials or external services that are not yet configured.
```

### Phase 3: QA Review
Verify the Builder's changes before writing tests or merging:
```
Use the qa-reviewer agent to verify the builder's last batch of changes.
```

### Phase 4: Test & Verify
Ensure regression prevention and error-path coverage:
```
Use the tester agent to write/update tests for the approved batch and run the full test suite.
```

Repeat this cycle for remaining batches until all mock/hardcoded elements are replaced.

---

## Key Principles

- **Sequential Execution**: Each agent builds upon the verified output of the preceding phase.
- **Read-Only Safety**: The Auditor never modifies files (`Read, Grep, Glob` only).
- **No Invented Endpoints or Mock Data**: When a real API endpoint, schema, or credential is missing, the Builder stops and flags it rather than creating new placeholders.
- **Independent QA**: QA review runs separately from the Builder to catch edge cases, missing error handling, and accidental layout regressions.
