#!/usr/bin/env python3
"""
LedgerOne Unified Workspace Orchestrator.
Master control script for running tests, preflight system checks, database seeding,
test artifact cleanup, and local development lifecycle.
"""

import sys
import os
import argparse
import subprocess
import socket
import json
import time
import shutil
from pathlib import Path
from urllib.parse import urlparse

# Base directories
SCRIPTS_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = SCRIPTS_DIR.parent
VENV_PYTHON = SCRIPTS_DIR / ".venv" / "Scripts" / "python.exe"
PYTHON_BIN = str(VENV_PYTHON) if VENV_PYTHON.exists() else sys.executable

# Add project root to sys.path
sys.path.insert(0, str(PROJECT_ROOT))

from scripts.config import (
    BASE_URL,
    DEFAULT_TIMEOUT_MS,
    NAVIGATION_TIMEOUT_MS,
    SCREENSHOTS_DIR,
    ROUTES,
)

# Colors for terminal styling
class Colors:
    HEADER = "\033[95m"
    BLUE = "\033[94m"
    CYAN = "\033[96m"
    GREEN = "\033[92m"
    YELLOW = "\033[93m"
    RED = "\033[91m"
    BOLD = "\033[1m"
    DIM = "\033[2m"
    RESET = "\033[0m"

    @classmethod
    def strip_or_style(cls, text: str, style: str) -> str:
        if os.name == "nt" and "WT_SESSION" not in os.environ and "TERM" not in os.environ:
            # Enable ANSI in standard Windows cmd/powershell
            os.system("")
        return f"{style}{text}{cls.RESET}"

def cprint(text: str, style: str = Colors.RESET):
    print(Colors.strip_or_style(text, style))

# Suite & Feature registry
TEST_SUITES = {
    "auth": {
        "suite_num": "01",
        "file": "scripts/tests/test_01_auth.py",
        "name": "Authentication & Session Management",
        "usecases": ["UC-01 (Sign Up)", "UC-02 (Login)", "UC-03 (Forgot Password)", "Role-based Redirects"],
    },
    "dashboard": {
        "suite_num": "02",
        "file": "scripts/tests/test_02_dashboard.py",
        "name": "Executive ERP Dashboard & KPI Metrics",
        "usecases": ["UC-04 (Dashboard Metrics)", "Quick Actions", "Financial Graphs"],
    },
    "contacts": {
        "suite_num": "03",
        "file": "scripts/tests/test_03_contacts.py",
        "name": "Contact Management (Customers & Vendors)",
        "usecases": ["UC-05 (Customer Record)", "UC-06 (Vendor Record)", "UC-07 (Archive)", "Contact Filter"],
    },
    "products": {
        "suite_num": "04",
        "file": "scripts/tests/test_04_products.py",
        "name": "Product & Inventory Catalog",
        "usecases": ["UC-08 (Create Product)", "UC-09 (Update Stock)", "Low Stock Alert"],
    },
    "accounts": {
        "suite_num": "05",
        "file": "scripts/tests/test_05_accounts.py",
        "name": "Chart of Accounts (COA)",
        "usecases": ["UC-13 (Create Account)", "UC-14 (Archive Account)", "COA Hierarchy View"],
    },
    "purchases": {
        "suite_num": "06",
        "file": "scripts/tests/test_06_purchases.py",
        "name": "Purchases & Accounts Payable",
        "usecases": ["UC-19 (Purchase Order)", "UC-20 (Vendor Bill)", "UC-21 (Bill Approval)"],
    },
    "sales": {
        "suite_num": "07",
        "file": "scripts/tests/test_07_sales.py",
        "name": "Sales Cycle & Accounts Receivable",
        "usecases": ["UC-22 (Sales Order)", "UC-23 (Customer Invoice)", "UC-24 (Confirm Invoice)"],
    },
    "payments": {
        "suite_num": "08",
        "file": "scripts/tests/test_08_payments.py",
        "name": "Payment Processing & Reconciliation",
        "usecases": ["UC-25 (Register Payment)", "Payment Dialogs", "Auto-Allocation"],
    },
    "journal_entries": {
        "suite_num": "09",
        "file": "scripts/tests/test_09_journal_entries.py",
        "name": "Manual & Automated Journal Entries",
        "usecases": ["UC-15 (Manual Entry)", "UC-16 (Post Entry)", "UC-17 (Audit Check)", "Double-Entry Balance"],
    },
    "budgets": {
        "suite_num": "10",
        "file": "scripts/tests/test_10_budgets.py",
        "name": "Analytical Budgeting & Achievement",
        "usecases": ["UC-10 (Create Budget)", "UC-11 (Revise Budget)", "UC-12 (Cancel Budget)", "UC-29/30 (Tracking)"],
    },
    "reports": {
        "suite_num": "11",
        "file": "scripts/tests/test_11_reports.py",
        "name": "Financial Reporting & Analytics",
        "usecases": ["UC-26 (Balance Sheet)", "UC-27 (Profit & Loss)", "UC-28 (Trial Balance)", "Export CSV/PDF"],
    },
    "portal": {
        "suite_num": "12",
        "file": "scripts/tests/test_12_portal.py",
        "name": "Dedicated Customer Portal",
        "usecases": ["Customer Portal Dashboard", "Invoices Self-Service", "Payment History"],
    },
    "rbac": {
        "suite_num": "13",
        "file": "scripts/tests/test_13_settings_rbac.py",
        "name": "Settings, Roles & Access Control",
        "usecases": ["Admin Workspace Access", "Accountant Navigation", "Restricted Routes Enforcement"],
    },
    "ai_assistant": {
        "suite_num": "14",
        "file": "scripts/tests/test_14_ai_assistant.py",
        "name": "LedgerOne AI Copilot Assistant",
        "usecases": ["AI Trigger Widget", "Chat Window Open/Close", "Natural Language Query Execution"],
    },
}

# Aliases
FEATURE_ALIASES = {
    "accounting": "journal_entries",
    "chat": "ai_assistant",
    "ai": "ai_assistant",
    "settings": "rbac",
    "coa": "accounts",
    "invoices": "sales",
    "bills": "purchases",
}


def print_banner():
    cprint("================================================================================", Colors.BOLD + Colors.CYAN)
    cprint("                ⚡ LEDGERONE UNIFIED WORKSPACE ORCHESTRATOR ⚡                  ", Colors.BOLD + Colors.CYAN)
    cprint("       Automated Testing • Health Checks • Data Seeding • Service Ops          ", Colors.DIM)
    cprint("================================================================================", Colors.BOLD + Colors.CYAN)


def check_tcp_port(host: str, port: int, timeout: float = 3.0) -> bool:
    """Check if a host and TCP port is open."""
    for target in (host, "127.0.0.1", "localhost", "::1"):
        try:
            with socket.create_connection((target, port), timeout=timeout):
                return True
        except Exception:
            continue
    return False


def get_db_info() -> tuple[str, int]:
    """Extract database host and port from .env DATABASE_URL."""
    env_file = PROJECT_ROOT / ".env"
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith("DATABASE_URL="):
                    val = line.split("=", 1)[1].strip().strip('"').strip("'")
                    try:
                        parsed = urlparse(val)
                        return parsed.hostname or "localhost", parsed.port or 5432
                    except Exception:
                        pass
    return "10.120.27.85", 7002


def run_doctor() -> bool:
    """System pre-flight doctor: validates Node, Python, DB, Playwright, and Server."""
    cprint("\n[+] Running System & Environment Preflight Doctor...\n", Colors.BOLD + Colors.BLUE)
    all_healthy = True

    # 1. Python Environment
    cprint("  [1/6] Python Virtual Environment:", Colors.BOLD)
    if Path(PYTHON_BIN).exists():
        py_ver = subprocess.run([PYTHON_BIN, "--version"], capture_output=True, text=True).stdout.strip()
        cprint(f"        ✓ Python found: {py_ver} ({PYTHON_BIN})", Colors.GREEN)
    else:
        cprint(f"        ✗ Virtual environment Python missing at {PYTHON_BIN}!", Colors.RED)
        all_healthy = False

    # 2. Node.js & Tooling
    cprint("  [2/6] Node.js & Tooling:", Colors.BOLD)
    try:
        node_ver = subprocess.run(["node", "-v"], capture_output=True, text=True, shell=True).stdout.strip()
        cprint(f"        ✓ Node.js installed: {node_ver}", Colors.GREEN)
    except Exception:
        cprint("        ✗ Node.js not detected in PATH!", Colors.RED)
        all_healthy = False

    # 3. PostgreSQL Database
    cprint("  [3/6] PostgreSQL Database Connectivity:", Colors.BOLD)
    db_host, db_port = get_db_info()
    if check_tcp_port(db_host, db_port, timeout=3.0):
        cprint(f"        ✓ PostgreSQL responding on {db_host}:{db_port}", Colors.GREEN)
    else:
        cprint(f"        ✗ PostgreSQL unreachable on {db_host}:{db_port}!", Colors.RED)
        all_healthy = False

    # 4. Next.js Web Server
    cprint("  [4/6] Next.js Web Application Server:", Colors.BOLD)
    parsed = urlparse(BASE_URL)
    app_host = parsed.hostname or "localhost"
    app_port = parsed.port or (443 if parsed.scheme == "https" else 80)
    if check_tcp_port(app_host, app_port, timeout=2.0):
        cprint(f"        ✓ App server responding at {BASE_URL}", Colors.GREEN)
    else:
        cprint(f"        ! App server is NOT responding on port {app_port}.", Colors.YELLOW)
        cprint("          Start it with: npm run dev or 'orchestrate.py dev'", Colors.DIM)
        all_healthy = False

    # 5. Playwright & Pytest
    cprint("  [5/6] Playwright Test Framework:", Colors.BOLD)
    try:
        check_pw = subprocess.run(
            [PYTHON_BIN, "-c", "import playwright; print('Playwright ready')"],
            capture_output=True,
            text=True,
        )
        if check_pw.returncode == 0:
            cprint("        ✓ Playwright Python packages verified", Colors.GREEN)
        else:
            cprint("        ✗ Playwright packages missing in virtualenv!", Colors.RED)
            all_healthy = False
    except Exception as e:
        cprint(f"        ✗ Failed to check Playwright: {e}", Colors.RED)
        all_healthy = False

    # 6. Failure Screenshot Storage
    cprint("  [6/6] Screenshot Artifact Directory:", Colors.BOLD)
    SCREENSHOTS_DIR.mkdir(parents=True, exist_ok=True)
    cprint(f"        ✓ Screenshots directory: {SCREENSHOTS_DIR}", Colors.GREEN)

    cprint("\n" + ("=" * 80), Colors.DIM)
    if all_healthy:
        cprint("  [✓] PREFLIGHT STATUS: ALL SYSTEMS HEALTHY AND OPERATIONAL\n", Colors.BOLD + Colors.GREEN)
    else:
        cprint("  [!] PREFLIGHT STATUS: ONE OR MORE ISSUES DETECTED (Review above)\n", Colors.BOLD + Colors.YELLOW)
    return all_healthy


def list_suites():
    """Print a clean table of all 14 test suites and covered use cases."""
    cprint("\nRegistered LedgerOne Test Suites & Feature Map:\n", Colors.BOLD + Colors.CYAN)
    header = f"{'#':<4} {'Key':<16} {'Feature Name':<38} {'Use Cases / Scope'}"
    cprint(header, Colors.BOLD)
    cprint("-" * 105, Colors.DIM)
    
    for key, info in TEST_SUITES.items():
        usecases_str = ", ".join(info["usecases"][:3])
        if len(info["usecases"]) > 3:
            usecases_str += f" +{len(info['usecases'])-3} more"
        line = f"{info['suite_num']:<4} {key:<16} {info['name']:<38} {usecases_str}"
        cprint(line)
    cprint("-" * 105 + "\n", Colors.DIM)


def clean_artifacts():
    """Clean failure screenshots, pycache, and temporary test artifacts."""
    cprint("\n[+] Cleaning test artifacts and temporary files...", Colors.BLUE)
    
    # 1. Clean screenshots
    count = 0
    if SCREENSHOTS_DIR.exists():
        for f in SCREENSHOTS_DIR.glob("*.png"):
            try:
                f.unlink()
                count += 1
            except Exception:
                pass
    cprint(f"  ✓ Removed {count} old failure screenshot(s)", Colors.GREEN)

    # 2. Clean pytest cache
    pytest_cache = PROJECT_ROOT / ".pytest_cache"
    if pytest_cache.exists():
        shutil.rmtree(pytest_cache, ignore_errors=True)
        cprint("  ✓ Removed .pytest_cache", Colors.GREEN)

    # 3. Clean __pycache__
    for p in PROJECT_ROOT.glob("**/__pycache__"):
        if ".venv" not in str(p) and "node_modules" not in str(p):
            shutil.rmtree(p, ignore_errors=True)
    cprint("  ✓ Cleared python bytecode caches\n", Colors.GREEN)


def seed_database():
    """Execute Prisma seed script to refresh test users and demo data."""
    cprint("\n[+] Seeding database with demo users, chart of accounts, and products...", Colors.BOLD + Colors.BLUE)
    cmd = ["npx", "tsx", "prisma/seed.ts"]
    res = subprocess.run(cmd, cwd=str(PROJECT_ROOT), shell=True)
    if res.returncode == 0:
        cprint("\n  [✓] Database seed successfully completed!\n", Colors.BOLD + Colors.GREEN)
    else:
        cprint(f"\n  [✗] Database seed failed with exit code {res.returncode}\n", Colors.BOLD + Colors.RED)
    return res.returncode == 0


def start_dev_server():
    """Ensure dev server is running, or notify user to start."""
    parsed = urlparse(BASE_URL)
    app_host = parsed.hostname or "localhost"
    app_port = parsed.port or 3000
    
    if check_tcp_port(app_host, app_port, timeout=1.5):
        cprint(f"\n  [✓] Dev server is already running on {BASE_URL}!\n", Colors.BOLD + Colors.GREEN)
        return True

    cprint(f"\n[+] Starting LedgerOne dev server on port {app_port}...", Colors.BOLD + Colors.BLUE)
    cprint("    Note: For continuous development, run 'npm run dev' in its own terminal.", Colors.DIM)
    subprocess.Popen(["npm", "run", "dev"], cwd=str(PROJECT_ROOT), shell=True)
    
    cprint("    Waiting for server to spin up...", Colors.DIM)
    for _ in range(15):
        time.sleep(2)
        if check_tcp_port(app_host, app_port, timeout=1.0):
            cprint(f"\n  [✓] Dev server is now UP and responding at {BASE_URL}!\n", Colors.BOLD + Colors.GREEN)
            return True
    cprint("    ! Timed out waiting for dev server. Please verify terminal output.", Colors.YELLOW)
    return False


def run_tests(
    feature: str = "all",
    suite_num: str = None,
    headed: bool = False,
    retries: int = 0,
    html_report: str = None,
    filter_expr: str = None,
    verbose: bool = False,
    skip_health: bool = False,
) -> int:
    """Execute the selected Playwright test suite(s)."""
    if not skip_health:
        parsed = urlparse(BASE_URL)
        if not check_tcp_port(parsed.hostname or "localhost", parsed.port or 3000):
            cprint(f"\n[!] ERROR: Target application server is not responding at {BASE_URL}!", Colors.BOLD + Colors.RED)
            cprint("   Please start your LedgerOne development server:", Colors.YELLOW)
            cprint("     npm run dev   (or run 'orchestrate.py dev')", Colors.CYAN)
            return 1

    # Resolve target files
    target_files = []
    if suite_num:
        padded_num = suite_num.zfill(2)
        found = False
        for k, v in TEST_SUITES.items():
            if v["suite_num"] == padded_num:
                target_files.append(str(PROJECT_ROOT / v["file"]))
                found = True
                break
        if not found:
            cprint(f"\n[!] ERROR: Suite number '{suite_num}' not found. Run 'orchestrate.py list' to see available numbers.", Colors.RED)
            return 1
    elif feature == "all":
        target_files = ["scripts/tests"]
    else:
        resolved_key = FEATURE_ALIASES.get(feature.lower(), feature.lower())
        if resolved_key in TEST_SUITES:
            target_files.append(str(PROJECT_ROOT / TEST_SUITES[resolved_key]["file"]))
        else:
            cprint(f"\n[!] ERROR: Feature '{feature}' not recognized.", Colors.RED)
            cprint(f"    Available features: {', '.join(list(TEST_SUITES.keys()))}", Colors.YELLOW)
            return 1

    # Set Headless / Headed environment variable
    os.environ["TEST_HEADLESS"] = "false" if headed else "true"

    # Build pytest command
    pytest_args = [PYTHON_BIN, "-m", "pytest"] + target_files

    if verbose:
        pytest_args.append("-v")

    if filter_expr:
        pytest_args.extend(["-k", filter_expr])

    report_path = None
    if html_report:
        try:
            has_html_plugin = subprocess.run(
                [PYTHON_BIN, "-c", "import pytest_html"], capture_output=True
            ).returncode == 0
        except Exception:
            has_html_plugin = False
            
        if has_html_plugin:
            report_path = PROJECT_ROOT / html_report
            pytest_args.extend(["--html", str(report_path), "--self-contained-html"])
        else:
            cprint("  [!] Note: pytest-html plugin not installed in virtualenv, skipping HTML report generation.", Colors.YELLOW)

    cprint("\n" + "=" * 80, Colors.BOLD + Colors.CYAN)
    cprint(f"  [*] Executing LedgerOne E2E Test Suite", Colors.BOLD)
    cprint(f"  Target: {feature.upper() if not suite_num else f'Suite {suite_num}'}")
    cprint(f"  Mode: {'Headed (Visible UI Browser)' if headed else 'Headless (Fast Background)'}")
    cprint(f"  Base URL: {BASE_URL}")
    if report_path:
        cprint(f"  HTML Report: {report_path.name}")
    cprint("=" * 80 + "\n", Colors.BOLD + Colors.CYAN)

    start_time = time.time()
    result = subprocess.run(pytest_args, cwd=str(PROJECT_ROOT))
    duration = time.time() - start_time

    cprint("\n" + "=" * 80, Colors.BOLD)
    if result.returncode == 0:
        cprint(f"  [✓] ALL TESTS PASSED SUCCESSFULLY in {duration:.2f}s!", Colors.BOLD + Colors.GREEN)
    else:
        cprint(f"  [✗] TEST RUN FINISHED WITH FAILURES (Exit Code: {result.returncode}) in {duration:.2f}s", Colors.BOLD + Colors.RED)
        screenshots = list(SCREENSHOTS_DIR.glob("*.png"))
        if screenshots:
            cprint(f"\n  Captured Failure Screenshots ({len(screenshots)} file(s)):", Colors.YELLOW)
            for sc in sorted(screenshots, key=os.path.getmtime, reverse=True)[:5]:
                cprint(f"   • {sc.name}", Colors.DIM)
            cprint(f"   Folder: {SCREENSHOTS_DIR}\n", Colors.DIM)

    cprint("=" * 80 + "\n", Colors.BOLD)
    return result.returncode


def interactive_menu():
    """Interactive Command Center for developer convenience."""
    while True:
        print_banner()
        cprint("  Select an action:", Colors.BOLD)
        cprint("    [1]  Run All E2E Tests (Headless - 14 Suites)", Colors.CYAN)
        cprint("    [2]  Run All E2E Tests (Headed - Visible Browser)", Colors.CYAN)
        cprint("    [3]  Run Specific Feature Suite...", Colors.CYAN)
        cprint("    [4]  Run System Doctor & Preflight Health Check", Colors.GREEN)
        cprint("    [5]  Seed Database (Prisma Seed)", Colors.YELLOW)
        cprint("    [6]  Start Next.js Development Server", Colors.YELLOW)
        cprint("    [7]  Clean Test Artifacts & Screenshots", Colors.BLUE)
        cprint("    [8]  List All 14 Test Suites & PRD Matrix", Colors.BLUE)
        cprint("    [0]  Exit", Colors.DIM)
        cprint("-" * 80, Colors.DIM)
        
        try:
            choice = input("Enter choice [0-8]: ").strip()
        except (KeyboardInterrupt, EOFError):
            print("\nExiting.")
            sys.exit(0)

        if choice == "1":
            run_tests(feature="all", headed=False)
            input("\nPress Enter to return to menu...")
        elif choice == "2":
            run_tests(feature="all", headed=True)
            input("\nPress Enter to return to menu...")
        elif choice == "3":
            list_suites()
            feat = input("Enter feature key (e.g. auth, sales, budgets) or suite number (01-14): ").strip()
            if feat:
                if feat.isdigit():
                    run_tests(suite_num=feat, headed=False)
                else:
                    run_tests(feature=feat, headed=False)
            input("\nPress Enter to return to menu...")
        elif choice == "4":
            run_doctor()
            input("\nPress Enter to return to menu...")
        elif choice == "5":
            seed_database()
            input("\nPress Enter to return to menu...")
        elif choice == "6":
            start_dev_server()
            input("\nPress Enter to return to menu...")
        elif choice == "7":
            clean_artifacts()
            input("\nPress Enter to return to menu...")
        elif choice == "8":
            list_suites()
            input("\nPress Enter to return to menu...")
        elif choice == "0":
            cprint("\nGoodbye!\n", Colors.GREEN)
            break
        else:
            cprint("\nInvalid choice. Try again.\n", Colors.RED)


def main():
    parser = argparse.ArgumentParser(
        description="LedgerOne Unified Workspace Orchestrator CLI"
    )
    subparsers = parser.add_subparsers(dest="command", help="Orchestration command")

    # Command: run / test
    test_parser = subparsers.add_parser("test", aliases=["run"], help="Run Playwright E2E tests")
    test_parser.add_argument("-f", "--feature", default="all", help="Feature name (e.g. auth, purchases, sales, all)")
    test_parser.add_argument("-s", "--suite", help="Suite number (e.g. 01, 06, 07, 10)")
    test_parser.add_argument("--headed", action="store_true", help="Launch browser in headed (visible) mode")
    test_parser.add_argument("-k", "--filter", help="Test filter expression (-k)")
    test_parser.add_argument("-v", "--verbose", action="store_true", help="Verbose pytest output")
    test_parser.add_argument("--html", help="HTML report output filename (e.g. report.html)")
    test_parser.add_argument("--skip-health", action="store_true", help="Skip pre-flight server check")

    # Command: doctor / health
    subparsers.add_parser("doctor", aliases=["health", "preflight"], help="Verify system prerequisites and server health")

    # Command: list
    subparsers.add_parser("list", help="List all 14 test suites and PRD mappings")

    # Command: seed
    subparsers.add_parser("seed", help="Seed database with demo data")

    # Command: dev
    subparsers.add_parser("dev", help="Start Next.js dev server")

    # Command: clean
    subparsers.add_parser("clean", help="Clean failure screenshots and cache")

    # Command: all
    subparsers.add_parser("all", help="Run full pipeline: doctor -> seed -> test -> clean")

    args = parser.parse_args()

    # Reconfigure stdout for Windows console UTF-8 support
    if sys.platform == "win32":
        try:
            sys.stdout.reconfigure(encoding="utf-8")
            sys.stderr.reconfigure(encoding="utf-8")
        except Exception:
            pass

    if not args.command:
        # If no arguments provided, launch interactive menu
        interactive_menu()
        return

    cmd = args.command.lower()
    if cmd in ("test", "run"):
        code = run_tests(
            feature=args.feature,
            suite_num=args.suite,
            headed=args.headed,
            html_report=args.html,
            filter_expr=args.filter,
            verbose=args.verbose,
            skip_health=args.skip_health,
        )
        sys.exit(code)
    elif cmd in ("doctor", "health", "preflight"):
        ok = run_doctor()
        sys.exit(0 if ok else 1)
    elif cmd == "list":
        list_suites()
    elif cmd == "seed":
        ok = seed_database()
        sys.exit(0 if ok else 1)
    elif cmd == "dev":
        start_dev_server()
    elif cmd == "clean":
        clean_artifacts()
    elif cmd == "all":
        print_banner()
        if not run_doctor():
            cprint("[!] Preflight checks had warnings, proceeding...", Colors.YELLOW)
        seed_database()
        code = run_tests(feature="all", headed=False)
        sys.exit(code)


if __name__ == "__main__":
    main()
