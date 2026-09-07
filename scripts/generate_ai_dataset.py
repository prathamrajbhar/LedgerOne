"""
Generate complete production seed payload using Ollama (gpt-oss:20b-cloud).
Saves to scripts/production_seed_payload.json.
"""

import json
from pathlib import Path
from scripts.ollama_client import generate_indian_contacts, generate_furniture_catalog

OUTPUT_FILE = Path(__file__).resolve().parent / "production_seed_payload.json"


def build_full_payload():
    print("1. Synthesizing 45 Indian contacts with Ollama (gpt-oss:20b-cloud)...")
    contacts = generate_indian_contacts(45)

    print("2. Generating furniture catalog and inventory...")
    products = generate_furniture_catalog()

    # Product Categories
    categories = [
        "Living Room",
        "Bedroom",
        "Dining Room",
        "Executive Office",
        "Decor & Lighting",
        "Raw Materials",
        "Services",
        "Combos",
    ]

    # Chart of Accounts (standard Indian accounting & GST ready)
    chart_of_accounts = [
        {"code": "1000", "name": "Cash on Hand (Main Vault)", "type": "CASH"},
        {"code": "1010", "name": "HDFC Bank Current Account - 5020001", "type": "BANK"},
        {"code": "1020", "name": "ICICI Bank Operations Account - 001205", "type": "BANK"},
        {"code": "1050", "name": "Accounts Receivable (Debtors Ledger)", "type": "ASSET"},
        {"code": "1200", "name": "Finished Furniture Inventory", "type": "ASSET"},
        {"code": "1210", "name": "Raw Timber & Hardware Stock", "type": "ASSET"},
        {"code": "1500", "name": "Woodworking Machinery & Tools", "type": "ASSET"},
        {"code": "1510", "name": "Accumulated Depreciation - Machinery", "type": "ASSET"},
        {"code": "2000", "name": "Accounts Payable (Creditors Ledger)", "type": "LIABILITY"},
        {"code": "2050", "name": "GST Output Tax Payable (18%)", "type": "LIABILITY"},
        {"code": "2051", "name": "GST Output Tax Payable (12%)", "type": "LIABILITY"},
        {"code": "2052", "name": "GST Output Tax Payable (28%)", "type": "LIABILITY"},
        {"code": "2060", "name": "GST Input Tax Credit (Receivable)", "type": "ASSET"},
        {"code": "3000", "name": "Promoters Equity & Capital", "type": "CAPITAL"},
        {"code": "3010", "name": "Retained Earnings & Reserves", "type": "CAPITAL"},
        {"code": "4000", "name": "Domestic Furniture Sales Revenue", "type": "INCOME"},
        {"code": "4010", "name": "Architectural Design & Custom Fitouts", "type": "INCOME"},
        {"code": "5000", "name": "Cost of Goods Sold - Timber & Materials", "type": "EXPENSES"},
        {"code": "5010", "name": "Factory Direct Labour & Carpentry", "type": "EXPENSES"},
        {"code": "6000", "name": "Showroom Lease & Warehouse Rent", "type": "EXPENSES"},
        {"code": "6010", "name": "Pan-India Freight & Logistics", "type": "EXPENSES"},
        {"code": "6020", "name": "Omnichannel Advertising & Brand Promotion", "type": "EXPENSES"},
        {"code": "6030", "name": "Executive & Support Staff Salaries", "type": "EXPENSES"},
        {"code": "6040", "name": "Electricity, Generator & Utilities", "type": "EXPENSES"},
        {"code": "6050", "name": "Depreciation Expense on Fixed Assets", "type": "EXPENSES"},
        {"code": "7010", "name": "Bank Charges & Payment Gateway Processing", "type": "OTHER_EXPENSES"},
    ]

    # Tax Rates
    tax_rates = [
        {"name": "GST 0% (Exempt Agricultural Timber)", "percentage": 0.0, "applicability": "BOTH"},
        {"name": "GST 5% (Job Work & Basic Processing)", "percentage": 5.0, "applicability": "BOTH"},
        {"name": "GST 12% (Standard Furniture & Woodcraft)", "percentage": 12.0, "applicability": "BOTH"},
        {"name": "GST 18% (Premium Designer & Upholstered Furniture)", "percentage": 18.0, "applicability": "BOTH"},
        {"name": "GST 28% (Luxury Carved & Brass Inlay Heirlooms)", "percentage": 28.0, "applicability": "BOTH"},
    ]

    # Analytic Accounts (Cost Centers)
    analytic_accounts = [
        {"name": "Mumbai Flagship Experience Center", "type": "INCOME"},
        {"name": "Bengaluru Koramangala Studio", "type": "INCOME"},
        {"name": "Delhi NCR Design Gallery", "type": "INCOME"},
        {"name": "Direct-to-Consumer Online Channel", "type": "INCOME"},
        {"name": "B2B Hospitality & Corporate Projects", "type": "INCOME"},
        {"name": "Jodhpur Central Woodcraft Factory", "type": "EXPENSES"},
        {"name": "Raw Timber Sourcing & Seasoning", "type": "EXPENSES"},
        {"name": "Pan-India Logistics & Delivery", "type": "EXPENSES"},
        {"name": "Marketing & Festive Campaigns", "type": "EXPENSES"},
    ]

    # Journals configuration
    journals = [
        {"code": "SALES", "name": "Customer Sales Journal", "type": "SALES", "accountCode": "4000"},
        {"code": "PURCHASE", "name": "Vendor Purchase Journal", "type": "PURCHASE", "accountCode": "5000"},
        {"code": "HDFC", "name": "HDFC Current Account Journal", "type": "BANK", "accountCode": "1010"},
        {"code": "CASH", "name": "Main Office Petty Cash Journal", "type": "CASH", "accountCode": "1000"},
    ]

    payload = {
        "company": {
            "companyName": "Maharaja Heritage Furniture Solutions Pvt. Ltd.",
            "address": "Maharaja House, 42 Link Road, Andheri West, Mumbai, Maharashtra 400053",
            "baseCurrency": "INR",
            "fiscalYearStartMonth": 4,  # April to March Indian FY
            "poNumberPrefix": "PO",
            "billNumberPrefix": "BILL",
            "soNumberPrefix": "SO",
            "invoiceNumberPrefix": "INV",
            "jeNumberPrefix": "JE",
        },
        "categories": categories,
        "chart_of_accounts": chart_of_accounts,
        "tax_rates": tax_rates,
        "analytic_accounts": analytic_accounts,
        "journals": journals,
        "products": products,
        "contacts": contacts,
    }

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(f"✓ Production seed payload saved successfully to {OUTPUT_FILE}")
    print(f"  - Contacts: {len(contacts)} (All @yopmail.com)")
    print(f"  - Products: {len(products)}")
    print(f"  - Accounts: {len(chart_of_accounts)}")
    print(f"  - Tax Rates: {len(tax_rates)}")
    print(f"  - Analytic Accounts: {len(analytic_accounts)}")
    print(f"  - Journals: {len(journals)}")


if __name__ == "__main__":
    build_full_payload()
