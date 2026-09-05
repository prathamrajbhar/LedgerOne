#!/usr/bin/env python3
"""
LedgerOne Playwright Test Runner CLI.
Provides feature-based test execution, server health-checks, and report formatting.
"""

import sys
import os
import argparse
import subprocess
from pathlib import Path

# Add scripts directory to path
SCRIPTS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPTS_DIR.parent
sys.path.insert(0, str(PROJECT_ROOT))

from scripts.config import BASE_URL

# Map features to test file names
FEATURE_MAP = {
    "all": "scripts/tests",
    "auth": "scripts/tests/test_01_auth.py",
    "dashboard": "scripts/tests/test_02_dashboard.py",
    "contacts": "scripts/tests/test_03_contacts.py",
    "products": "scripts/tests/test_04_products.py",
    "accounts": "scripts/tests/test_05_accounts.py",
    "purchases": "scripts/tests/test_06_purchases.py",
    "sales": "scripts/tests/test_07_sales.py",
    "payments": "scripts/tests/test_08_payments.py",
    "journal_entries": "scripts/tests/test_09_journal_entries.py",
    "accounting": "scripts/tests/test_09_journal_entries.py",
    "budgets": "scripts/tests/test_10_budgets.py",
    "reports": "scripts/tests/test_11_reports.py",
    "portal": "scripts/tests/test_12_portal.py",
    "settings": "scripts/tests/test_13_settings_rbac.py",
    "rbac": "scripts/tests/test_13_settings_rbac.py",
    "ai_assistant": "scripts/tests/test_14_ai_assistant.py",
    "chat": "scripts/tests/test_14_ai_assistant.py",
}


def check_server_health(url: str) -> bool:
    """Check if the target application server port is open and accepting TCP connections."""
    import socket
    from urllib.parse import urlparse
    parsed = urlparse(url)
    host = parsed.hostname or "localhost"
    port = parsed.port or (443 if parsed.scheme == "https" else 80)
    
    # Try IPv4 and IPv6
    for target_host in (host, "127.0.0.1", "localhost", "::1"):
        try:
            with socket.create_connection((target_host, port), timeout=3):
                return True
        except Exception:
            continue
    return False


def main():
    parser = argparse.ArgumentParser(
        description="Run LedgerOne Feature-Wise Playwright E2E Tests in Python"
    )
    parser.add_argument(
        "-f",
        "--feature",
        choices=list(FEATURE_MAP.keys()),
        default="all",
        help="Feature module to test (default: all)",
    )
    parser.add_argument(
        "--headed",
        action="store_true",
        help="Run browser in visible (headed) mode",
    )
    parser.add_argument(
        "-k",
        "--expression",
        help="Filter tests by name expression (passed to pytest -k)",
    )
    parser.add_argument(
        "-v",
        "--verbose",
        action="store_true",
        help="Verbose pytest output",
    )
    parser.add_argument(
        "--html",
        help="Generate pytest HTML report file (e.g. report.html)",
    )
    parser.add_argument(
        "--skip-server-check",
        action="store_true",
        help="Skip checking if target application server is alive",
    )

    args = parser.parse_args()

    # Ensure utf-8 output on Windows consoles
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            sys.stderr.reconfigure(encoding="utf-8")
        except Exception:
            pass

    print("=" * 65)
    print("  [*] LedgerOne Playwright E2E Test Runner")
    print(f"  Target Server: {BASE_URL}")
    print(f"  Selected Feature: {args.feature.upper()}")
    print(f"  Mode: {'Headed (Visible UI)' if args.headed else 'Headless'}")
    print("=" * 65)

    # Server check
    if not args.skip_server_check:
        print(f"\n[1/2] Checking application server availability at {BASE_URL}...")
        if not check_server_health(BASE_URL):
            print(f"\n[!] ERROR: Target application server is not responding at {BASE_URL}!")
            print("   Please start your LedgerOne development server in another terminal:")
            print("     npm run dev")
            print("   Then re-run this script.")
            sys.exit(1)
        print("  [+] Server is alive and responding.\n")

    # Build pytest command
    target_path = FEATURE_MAP[args.feature]
    
    # Auto-detect local virtualenv python if present
    venv_python = SCRIPTS_DIR / ".venv" / "Scripts" / "python.exe"
    python_bin = str(venv_python) if venv_python.exists() else sys.executable
    
    pytest_args = [python_bin, "-m", "pytest", str(PROJECT_ROOT / target_path)]

    if args.headed:
        os.environ["TEST_HEADLESS"] = "false"
    else:
        os.environ["TEST_HEADLESS"] = "true"

    if args.verbose:
        pytest_args.append("-v")

    if args.expression:
        pytest_args.extend(["-k", args.expression])

    if args.html:
        pytest_args.extend(["--html", args.html, "--self-contained-html"])

    print(f"[2/2] Executing tests: {' '.join(pytest_args)}\n")
    result = subprocess.run(pytest_args, cwd=str(PROJECT_ROOT))
    sys.exit(result.returncode)


if __name__ == "__main__":
    main()
