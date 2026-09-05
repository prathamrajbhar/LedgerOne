# Production-Grade Seed Data Plan - LedgerOne

## Business Scenario

**Company:** Maharaja Furniture Solutions Pvt. Ltd.
- **Location:** Delhi (Sector 63, Noida)
- **Established:** January 2025
- **Business Model:** Manufacturing + Retail + B2B + Interior Design Services
- **Period:** April 2026 - September 2026 (FY 2026-27 Q1-Q2)

---

## 1. CORE DATA STRUCTURE

### 1.1 Chart of Accounts (Real Indian Accounting)
**Rationale:** Complete CoA for furniture manufacturing business with GST compliance

```
Assets (1000-1999):
- 1010: ICICI Business Account (Primary)
- 1020: HDFC Savings (Reserve)
- 1030: Axis Operating Account (Payroll)
- 1100: Accounts Receivable
- 1200: Finished Goods Inventory
- 1210: Raw Materials - Teak Wood
- 1220: Raw Materials - Fabric & Upholstery
- 1230: Work in Progress
- 1300-1430: Fixed Assets (Equipment, Vehicles, Fixtures)

Liabilities (2000-2999):
- 2000: Accounts Payable
- 2100: Credit Card Payable
- 2200-2230: GST Accounts (IGST, SGST, CGST, Receivable)
- 2300: Short-term Loan
- 2400: Salary Payable

Capital (3000):
- 3000: Proprietor's Capital (Opening: ₹50,00,000)

Income (4000-4999):
- 4000: Furniture Sales (Domestic)
- 4100: Wooden Furniture Sales
- 4200: Custom Furniture
- 4300-4400: Service Revenue

Expenses (5000-5999):
- 5000: COGS - Furniture
- 5010: Raw Materials
- 5100: Salaries (₹25,00,000/year = ₹2,08,333/month)
- 5200-5220: Rent (Showroom ₹1,50,000, Warehouse ₹1,00,000, Workshop ₹50,000/month)
- 5300-5330: Utilities (₹60,000/month)
- 5400-5430: Marketing (₹50,000-100,000/month)
- 5500-5610: Operational Expenses
- 5700-5830: Professional Fees
```

### 1.2 Products - Structured by Category & Margin
**Rationale:** Real product mix with consistent pricing & margins

**Living Room Category:**
| SKU | Product | Cost | Price | Margin% | Stock | Type |
|-----|---------|------|-------|---------|-------|------|
| LR-SOFA-001 | Teak 3-Seater Sofa | ₹18,000 | ₹35,000 | 94% | 8 | Goods |
| LR-TABL-001 | Sheesham Coffee Table | ₹4,500 | ₹11,000 | 144% | 15 | Goods |
| LR-TV-001 | TV Unit - MDF | ₹6,000 | ₹14,999 | 150% | 10 | Goods |

**Bedroom Category:**
| SKU | Product | Cost | Price | Margin% | Stock | Type |
|-----|---------|------|-------|---------|-------|------|
| BR-BED-KNG-001 | Teak King Bed | ₹22,000 | ₹54,999 | 150% | 6 | Goods |
| BR-DRSR-001 | Sheesham 6-Drawer | ₹12,000 | ₹34,999 | 192% | 8 | Goods |
| BR-WARD-001 | Mango Wood Wardrobe | ₹15,000 | ₹39,999 | 167% | 5 | Goods |

**Office Category:**
| SKU | Product | Cost | Price | Margin% | Stock | Type |
|-----|---------|------|-------|---------|-------|------|
| OF-DESK-001 | Executive Desk - Teak | ₹14,000 | ₹47,999 | 243% | 8 | Goods |
| OF-CHAIR-001 | Ergonomic Chair | ₹3,500 | ₹12,999 | 271% | 25 | Goods |
| OF-SHELF-001 | 4-Tier Bookshelf | ₹4,000 | ₹13,999 | 250% | 12 | Goods |

**Services:**
| SKU | Service | Cost | Price | Type |
|-----|---------|------|-------|------|
| SV-DELIV-001 | Delivery (Local) | ₹0 | ₹2,999 | Service |
| SV-ASSEM-001 | Assembly & Installation | ₹0 | ₹4,999 | Service |
| SV-DESIG-001 | Design Consultation (2hrs) | ₹0 | ₹9,999 | Service |

**Total: 25 products (20 goods + 5 services)**

### 1.3 Vendors - Realistic Relationships

**Primary Vendors (70% of purchases):**
1. **Rajendra Wood Suppliers** (Mumbai) - Teak & Sheesham
   - Payment Terms: Net 30
   - Average Order: ₹3,00,000-₹5,00,000
   - Frequency: Every 10 days

2. **Mango Wood Industries** (Bangalore) - Mango wood
   - Payment Terms: Net 45
   - Average Order: ₹1,50,000-₹2,50,000
   - Frequency: Every 15 days

3. **Fabric Wholesale Surat** - Upholstery
   - Payment Terms: Net 30
   - Average Order: ₹1,00,000-₹1,50,000
   - Frequency: Every 20 days

**Secondary Vendors (30% of purchases):**
- Hardware/Metal suppliers
- Packaging suppliers
- Paint/Varnish suppliers

### 1.4 Customers - Segmented by Type

**B2B Corporate (40% of revenue):**
1. Taj Hotels Group (Delhi) - ₹10,00,000+ annual potential
2. ITC Hotels (Mumbai) - ₹8,00,000+ annual
3. WeWork India - ₹5,00,000+ annual
4. Law Firms, Consulting Agencies

**B2B Retail (30% of revenue):**
- Interior design firms
- Furniture retailers (resellers)
- Property developers

**B2C Individual (30% of revenue):**
- High-value homeowners
- Office owners
- Design-conscious customers

---

## 2. TRANSACTION FLOW - REALISTIC PATTERNS

### Purchase Cycle (Weekly Pattern)

**Week 1 (May 1-7, 2026):**
- **May 1:** PO-001 to Rajendra (₹4,50,000) - 8x Sofas, 4x Beds
- **May 3:** PO-002 to Fabric Wholesale (₹1,20,000) - Upholstery materials
- **May 5:** PO-003 to Mango Industries (₹80,000) - Wood stock

**Week 2:**
- **May 8:** Bills received for above POs (net 30 terms)
- **May 12:** PO-004 to Hardware supplier (₹40,000)

**Payment Pattern:**
- 60% pay within 5 days (early bird discount opportunity)
- 40% pay on due date (net 30)
- 0% late payments (reputable business)

### Sales Cycle (Daily Pattern)

**High-Value B2B Sales (Taj Hotels):**
- May 15: SO-001 for hotel lobby (₹10,00,000+)
  - Items: 6x Sofas, 8x Dining Sets, 10x Custom Tables
  - Tax: 18% GST
  - Terms: Net 15
  - Payment: Bank transfer (via gateway - Razorpay)

**Retail Sales:**
- May 18: SO-002 to Interior Designer (₹2,50,000)
- May 20: SO-003 to Furniture Retailer (₹1,80,000)

**Individual Sales (Portal):**
- May 22: SO-004 (Portal customer Rajesh) - ₹85,000
- May 25: SO-005 (Portal customer Priya) - ₹1,20,000

---

## 3. JOURNAL ENTRIES - AUTOMATIC & MANUAL

### Auto-Generated (System creates these):

1. **Bill Confirmation Entry:** Debit COGS/Inventory, Credit AP
2. **Bill Payment Entry:** Debit AP, Credit Bank
3. **Invoice Creation Entry:** Debit AR, Credit Revenue + GST Payable
4. **Invoice Payment Entry:** Debit Bank, Credit AR

### Manual Entries (Accountant creates):

1. **Opening Balance (Apr 1):** Assets vs Capital
2. **Monthly Depreciation:** Last day of month
3. **Monthly Salary Accrual:** Last day of month
4. **Monthly Rent Payment:** 1st of month
5. **Quarterly GST Filing:** Adjustments
6. **Utility Payments:** Multiple throughout month

---

## 4. BUDGET TRACKING

**Q2 2026 (Apr-Jun) Budget:**
- Delhi Showroom Sales Target: ₹20,00,000 (Achievement: 85%)
- B2B Corporate Target: ₹15,00,000 (Achievement: 90%)
- Manufacturing Costs: ₹8,00,000 (Achievement: 78%)

**Q3 2026 (Jul-Sep) Budget:**
- Focus on festival season (August-September)
- Increase marketing budget by 40%
- Target: ₹30,00,000+ revenue

---

## 5. ROLE-BASED DATA ACCESS & WORKFLOWS

### Administrator Role
- **Sees:** Everything (all companies, all users, all reports)
- **Workflow:** Create/Edit Masters, Create POs/SOs, View all reports
- **Test Scenario:** Create new vendor, edit product pricing, view consolidated reports

### Accountant Role
- **Sees:** All financial data, all transactions, GL, reports
- **Cannot:** Edit masters, edit customer details
- **Workflow:** Record bills, record payments, post JE, generate trial balance
- **Test Scenario:** Receive bill from vendor, record payment, match entries, generate P&L

### Contact/Portal User Role
- **Sees:** Only own invoices, own orders, own payments
- **Cannot:** See other customers' data, access masters
- **Workflow:** View invoice, download, initiate payment (if available)
- **Test Scenario:** Login as Rajesh, view SO-004, see payment status

---

## 6. DATA CONSISTENCY RULES

1. **No orphaned records:** Every SO has corresponding invoice
2. **Balanced entries:** Every JE has Debit = Credit
3. **Realistic quantities:** Stock levels match order patterns
4. **Consistent pricing:** Same SKU = same price across orders
5. **Chronological:** Transactions are date-ordered and realistic
6. **No duplicates:** Each PO/SO/Invoice has unique number

---

## 7. IMPLEMENTATION CHECKLIST

- [ ] Define all masters (CoA, Products, Vendors, Customers, Tax Rates)
- [ ] Create opening balance entries
- [ ] Generate 6 weeks of POs with realistic patterns
- [ ] Generate 6 weeks of SOs with realistic patterns
- [ ] Auto-generate all matching journal entries
- [ ] Create manual entries (depreciation, rent, salary)
- [ ] Create budgets with real achievements
- [ ] Test all RBAC scenarios
- [ ] Verify all JE balances
- [ ] Test portal user access
- [ ] Generate reports and verify accuracy

---

## 8. DATA QUALITY METRICS

After seeding, verify:
- ✓ Total transactions: 50-60 (POs, SOs, invoices, payments)
- ✓ Journal entries: 80+ (auto + manual)
- ✓ All JE balanced: 100%
- ✓ Revenue recognition: Matches invoices
- ✓ COGS recognition: Matches bills
- ✓ AP accuracy: Matches unpaid bills
- ✓ AR accuracy: Matches unpaid invoices
- ✓ Portal users can see own data only
- ✓ Accountant can see all GL
- ✓ Budget achievement tracking works

