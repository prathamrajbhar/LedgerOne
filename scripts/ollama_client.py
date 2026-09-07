"""
Ollama Client for synthesizing realistic Indian accounting data using gpt-oss:20b-cloud.
"""

import json
import re
import urllib.request
import urllib.error
from typing import List, Dict, Any

OLLAMA_API_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "gpt-oss:20b-cloud"


def query_ollama(prompt: str) -> str:
    """Send a prompt to local Ollama daemon and return response text."""
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "stream": False,
        "format": "json",
    }
    req = urllib.request.Request(
        OLLAMA_API_URL,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json"},
    )
    with urllib.request.urlopen(req, timeout=120) as response:
        result = json.loads(response.read().decode("utf-8"))
        return result.get("response", "")


def extract_json(raw_text: str) -> Any:
    """Safely parse JSON from model output, stripping thinking or markdown fences."""
    cleaned = raw_text.strip()
    if cleaned.startswith("```json"):
        cleaned = cleaned[7:]
    if cleaned.startswith("```"):
        cleaned = cleaned[3:]
    if cleaned.endswith("```"):
        cleaned = cleaned[:-3]
    cleaned = cleaned.strip()

    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        # Fallback to regex finding json object or array
        match = re.search(r"(\{.*\}|\[.*\])", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        raise


def generate_indian_contacts(count: int = 45) -> List[Dict[str, Any]]:
    """Generate Indian-origin contacts with @yopmail.com emails and portal credentials."""
    prompt = f"""Generate a JSON list of exactly {count} realistic Indian business and individual contacts for a premium furniture & interior architecture company in India.
Each contact must have:
- "name": authentic Indian full name or enterprise name (e.g., "Rajesh Sharma", "Priya Sundaram", "Aarav Enterprises", "Sheesham Heritage Woodcraft", "Godrej Living Solutions")
- "type": "CUSTOMER" (approx 60%), "VENDOR" (approx 30%), or "BOTH" (approx 10%)
- "email": clean lowercase email ending strictly with "@yopmail.com" (e.g., "rajesh.sharma.blr@yopmail.com")
- "phone": realistic 10-digit Indian phone with +91 (e.g. "+91 98201 44321")
- "address": realistic street address in India (e.g., "42, 100 Feet Road, Indiranagar", "Plot 18, Okhla Industrial Area")
- "city": Indian city (e.g. Mumbai, Bengaluru, New Delhi, Jaipur, Hyderabad, Chennai, Surat, Pune, Ahmedabad)
- "state": corresponding Indian state (e.g. Maharashtra, Karnataka, Delhi, Rajasthan, Telangana, Tamil Nadu, Gujarat)
- "pincode": valid 6-digit Indian postal code (e.g. "560038", "400053", "110020", "302001")
- "portalPassword": "PortalUser123!"

Return JSON array of {count} objects directly: [ {{ ... }}, ... ]"""

    try:
        raw = query_ollama(prompt)
        data = extract_json(raw)
        if isinstance(data, dict) and "contacts" in data:
            data = data["contacts"]
        if isinstance(data, list) and len(data) >= count:
            # Enforce yopmail
            for c in data:
                email = c.get("email", "")
                if not email.endswith("@yopmail.com"):
                    local_part = email.split("@")[0] if "@" in email else "user"
                    c["email"] = f"{local_part}@yopmail.com"
            return data[:count]
    except Exception as e:
        print(f"Ollama generation warning: {e}. Using curated Indian baseline pool.")

    # High quality fallback ensuring complete dataset
    cities_states = [
        ("Mumbai", "Maharashtra", "400053", "Andheri West, Link Road"),
        ("Bengaluru", "Karnataka", "560038", "100 Feet Road, Indiranagar"),
        ("New Delhi", "Delhi", "110020", "Okhla Industrial Area Phase III"),
        ("Jaipur", "Rajasthan", "302001", "MI Road, Near Ajmeri Gate"),
        ("Hyderabad", "Telangana", "500032", "Gachibowli Financial District"),
        ("Chennai", "Tamil Nadu", "600002", "Anna Salai, Mount Road"),
        ("Surat", "Gujarat", "395002", "Ring Road Textile Hub"),
        ("Pune", "Maharashtra", "411004", "FC Road, Shivajinagar"),
        ("Ahmedabad", "Gujarat", "380015", "SG Highway, Prahlad Nagar"),
        ("Kolkata", "West Bengal", "700016", "Park Street Commercial Hub"),
    ]

    base_contacts = [
        ("Rajesh Sharma", "CUSTOMER", "rajesh.sharma.blr@yopmail.com", "+91 98450 12345"),
        ("Priya Sundaram", "CUSTOMER", "priya.sundaram.chn@yopmail.com", "+91 98401 56789"),
        ("Vikramaditya Singhania", "CUSTOMER", "vikram.singhania.mum@yopmail.com", "+91 98200 98765"),
        ("Ananya Deshmukh", "CUSTOMER", "ananya.deshmukh.pune@yopmail.com", "+91 97640 11223"),
        ("Aarav Mehta", "CUSTOMER", "aarav.mehta.ahd@yopmail.com", "+91 98250 33445"),
        ("Rohan Verma", "CUSTOMER", "rohan.verma.del@yopmail.com", "+91 98110 55667"),
        ("Sneha Kulkarni", "CUSTOMER", "sneha.kulkarni.mum@yopmail.com", "+91 98330 77889"),
        ("Karthik Ramanathan", "CUSTOMER", "karthik.raman.blr@yopmail.com", "+91 99800 22334"),
        ("Sunita Agarwal", "CUSTOMER", "sunita.agarwal.jpr@yopmail.com", "+91 94140 44556"),
        ("Deepak Nambiar", "CUSTOMER", "deepak.nambiar.hyd@yopmail.com", "+91 98490 66778"),
        ("Taj Palace Hospitality Group", "CUSTOMER", "procurement.taj@yopmail.com", "+91 98200 11111"),
        ("Oberoi Luxury Suites", "CUSTOMER", "interiors.oberoi@yopmail.com", "+91 98100 22222"),
        ("Infosys Campus Development", "CUSTOMER", "facilities.infosys@yopmail.com", "+91 99000 33333"),
        ("Wipro Infrastructure Pvt Ltd", "CUSTOMER", "workspace.wipro@yopmail.com", "+91 98800 44444"),
        ("Mindtree Design Studio", "CUSTOMER", "projects.mindtree@yopmail.com", "+91 98450 55555"),
        ("DLF Cybercity Executive Floors", "CUSTOMER", "dlf.cybercity@yopmail.com", "+91 98110 66666"),
        ("Lodha Bellissimo Residences", "CUSTOMER", "lodha.procure@yopmail.com", "+91 98200 77777"),
        ("Prestige Estates Projects", "CUSTOMER", "prestige.living@yopmail.com", "+91 98450 88888"),
        ("Godrej Properties Interior Wing", "CUSTOMER", "godrej.interior@yopmail.com", "+91 98200 99999"),
        ("Brigade Gateway Offices", "CUSTOMER", "brigade.procure@yopmail.com", "+91 98450 00001"),
        ("Suresh Chand Jain", "CUSTOMER", "suresh.jain.del@yopmail.com", "+91 98101 12340"),
        ("Meera Krishnan", "CUSTOMER", "meera.krishnan.chn@yopmail.com", "+91 98402 23451"),
        ("Aditya Roy Kapoor", "CUSTOMER", "aditya.roy.mum@yopmail.com", "+91 98203 34562"),
        ("Pooja Hegde", "CUSTOMER", "pooja.hegde.blr@yopmail.com", "+91 98453 45673"),
        ("Harsh Vardhan Goel", "CUSTOMER", "harsh.goel.kol@yopmail.com", "+91 98301 56784"),
        ("Sheesham Heritage Timber Mills", "VENDOR", "sheesham.heritage@yopmail.com", "+91 94140 10001"),
        ("Dandeli Teakwood Suppliers", "VENDOR", "dandeli.teak@yopmail.com", "+91 94480 20002"),
        ("Aligarh Brass Hardware Craft", "VENDOR", "aligarh.brass@yopmail.com", "+91 98370 30003"),
        ("Moradabad Metal Inlay Works", "VENDOR", "moradabad.metal@yopmail.com", "+91 98371 40004"),
        ("Surat Premium Velvet Fabrics", "VENDOR", "surat.velvet@yopmail.com", "+91 98251 50005"),
        ("Bhilwara Upholstery Textures", "VENDOR", "bhilwara.tex@yopmail.com", "+91 94141 60006"),
        ("Saint-Gobain Glass Depot India", "VENDOR", "saintgobain.glass@yopmail.com", "+91 98400 70007"),
        ("Jodhpur Royal Wood Turners", "VENDOR", "jodhpur.turners@yopmail.com", "+91 94142 80008"),
        ("Pidilite Industrial Adhesives", "VENDOR", "pidilite.fittings@yopmail.com", "+91 98201 90009"),
        ("Asian Paints Wood Finishing", "VENDOR", "asianpaints.wood@yopmail.com", "+91 98202 00010"),
        ("Godrej Locks & Architectural", "VENDOR", "godrej.locks@yopmail.com", "+91 98203 11011"),
        ("Hettich India Hardware Sourcing", "VENDOR", "hettich.india@yopmail.com", "+91 98102 22022"),
        ("Hafele Premium Fittings", "VENDOR", "hafele.fittings@yopmail.com", "+91 98204 33033"),
        ("Nilambur Teak Agro Corp", "VENDOR", "nilambur.teak@yopmail.com", "+91 94470 44044"),
        ("Jaipur Marble & Stone Carvings", "VENDOR", "jaipur.marble@yopmail.com", "+91 94143 55055"),
        ("Deccan Architectural Atelier", "BOTH", "deccan.atelier@yopmail.com", "+91 98491 66066"),
        ("Koshish Interior Contractors", "BOTH", "koshish.interiors@yopmail.com", "+91 98103 77077"),
        ("Srijan Living Design Studio", "BOTH", "srijan.living@yopmail.com", "+91 98302 88088"),
        ("Vistara Corporate Spaces", "BOTH", "vistara.spaces@yopmail.com", "+91 98454 99099"),
        ("Chola Heritage Craft Guild", "BOTH", "chola.craft@yopmail.com", "+91 98403 00100"),
    ]

    contacts = []
    for i, (name, ctype, email, phone) in enumerate(base_contacts[:count]):
        loc = cities_states[i % len(cities_states)]
        contacts.append({
            "name": name,
            "type": ctype,
            "email": email,
            "phone": phone,
            "address": f"{loc[3]}, Sector {i+1}",
            "city": loc[0],
            "state": loc[1],
            "pincode": loc[2],
            "portalPassword": "PortalUser123!",
        })
    return contacts


def generate_furniture_catalog() -> List[Dict[str, Any]]:
    """Return a comprehensive catalog of 25+ authentic Indian furniture products."""
    return [
        # Living Room
        {"name": "Sheesham Solid Wood 3-Seater Sofa", "category": "Living Room", "type": "GOODS", "sku": "FUR-LIV-001", "cost": 18500, "salesPrice": 34000, "stock": 25, "reorderPoint": 5, "material": "Sheesham / Fabric"},
        {"name": "Teakwood Nesting Coffee Tables (Set of 2)", "category": "Living Room", "type": "GOODS", "sku": "FUR-LIV-002", "cost": 6200, "salesPrice": 12500, "stock": 40, "reorderPoint": 8, "material": "Burma Teak"},
        {"name": "Handcrafted TV Console with Rattan Weave", "category": "Living Room", "type": "GOODS", "sku": "FUR-LIV-003", "cost": 12000, "salesPrice": 22900, "stock": 18, "reorderPoint": 4, "material": "Mango Wood / Cane"},
        {"name": "Velvet Upholstered Wingback Lounge Chair", "category": "Living Room", "type": "GOODS", "sku": "FUR-LIV-004", "cost": 9500, "salesPrice": 18900, "stock": 30, "reorderPoint": 6, "material": "Sheesham / Velvet"},
        {"name": "Rajasthani Carved Jharokha Wall Mirror", "category": "Decor & Lighting", "type": "GOODS", "sku": "FUR-DEC-001", "cost": 3800, "salesPrice": 8500, "stock": 50, "reorderPoint": 10, "material": "Antiqued Teak"},
        # Bedroom
        {"name": "King Size Sheesham Bed with Hydraulic Storage", "category": "Bedroom", "type": "GOODS", "sku": "FUR-BED-001", "cost": 24000, "salesPrice": 48000, "stock": 20, "reorderPoint": 4, "material": "Solid Sheesham"},
        {"name": "Solid Mango Wood 4-Door Wardrobe", "category": "Bedroom", "type": "GOODS", "sku": "FUR-BED-002", "cost": 28000, "salesPrice": 56000, "stock": 12, "reorderPoint": 3, "material": "Kiln-Dried Mango Wood"},
        {"name": "Cane & Teak Bedside Table with Drawer", "category": "Bedroom", "type": "GOODS", "sku": "FUR-BED-003", "cost": 3500, "salesPrice": 7800, "stock": 60, "reorderPoint": 12, "material": "Teak / Natural Cane"},
        {"name": "Minimalist Dressing Table with Beveled Mirror", "category": "Bedroom", "type": "GOODS", "sku": "FUR-BED-004", "cost": 8500, "salesPrice": 16900, "stock": 22, "reorderPoint": 5, "material": "Sheesham Wood"},
        # Dining
        {"name": "6-Seater Solid Teak Dining Table", "category": "Dining Room", "type": "GOODS", "sku": "FUR-DIN-001", "cost": 21000, "salesPrice": 42000, "stock": 15, "reorderPoint": 3, "material": "Plantation Teak"},
        {"name": "Hand-Carved Dining Chairs (Pair)", "category": "Dining Room", "type": "GOODS", "sku": "FUR-DIN-002", "cost": 5500, "salesPrice": 11000, "stock": 45, "reorderPoint": 8, "material": "Teak / Cushioned"},
        {"name": "Buffet Sideboard Storage Credenza", "category": "Dining Room", "type": "GOODS", "sku": "FUR-DIN-003", "cost": 16500, "salesPrice": 32000, "stock": 14, "reorderPoint": 3, "material": "Rosewood Veneer"},
        # Office
        {"name": "Ergonomic High-Back Executive Leather Chair", "category": "Executive Office", "type": "GOODS", "sku": "FUR-OFF-001", "cost": 8200, "salesPrice": 15900, "stock": 35, "reorderPoint": 7, "material": "Top-Grain Leather / Chrome"},
        {"name": "Solid Wood Executive Desk with Cable Tray", "category": "Executive Office", "type": "GOODS", "sku": "FUR-OFF-002", "cost": 15000, "salesPrice": 29500, "stock": 16, "reorderPoint": 4, "material": "Hardwood Sheesham"},
        {"name": "Modular Open Display Bookshelf 5-Tier", "category": "Executive Office", "type": "GOODS", "sku": "FUR-OFF-003", "cost": 7500, "salesPrice": 14900, "stock": 28, "reorderPoint": 6, "material": "Mango Wood / Steel"},
        # Raw Materials
        {"name": "Kiln-Dried C.P. Teak Timber Planks (cu ft)", "category": "Raw Materials", "type": "GOODS", "sku": "RAW-TEAK-001", "cost": 2800, "salesPrice": 3500, "stock": 250, "reorderPoint": 50, "material": "Central Province Teak"},
        {"name": "Seasoned Sheesham Wood Blocks (cu ft)", "category": "Raw Materials", "type": "GOODS", "sku": "RAW-SHEESH-001", "cost": 1800, "salesPrice": 2400, "stock": 300, "reorderPoint": 60, "material": "North Indian Sheesham"},
        {"name": "Architectural Antique Brass Handles (Box of 20)", "category": "Raw Materials", "type": "GOODS", "sku": "RAW-BRASS-001", "cost": 2200, "salesPrice": 3200, "stock": 120, "reorderPoint": 25, "material": "Solid Cast Brass"},
        {"name": "Heavy-Duty Soft-Close Drawer Runners (Pair)", "category": "Raw Materials", "type": "GOODS", "sku": "RAW-HDW-001", "cost": 650, "salesPrice": 950, "stock": 400, "reorderPoint": 80, "material": "Zinc Plated Steel"},
        {"name": "Premium Royal Velvet Upholstery Fabric (Meter)", "category": "Raw Materials", "type": "GOODS", "sku": "RAW-FAB-001", "cost": 450, "salesPrice": 750, "stock": 500, "reorderPoint": 100, "material": "High-GSM Velvet"},
        # Services & Combos
        {"name": "Custom Furniture Assembly & Polishing Service", "category": "Services", "type": "SERVICE", "sku": "SRV-ASM-001", "cost": 1500, "salesPrice": 3500, "stock": 999, "reorderPoint": 0, "material": "Labour & Lacquer"},
        {"name": "Annual Furniture Maintenance Contract (AMC)", "category": "Services", "type": "SERVICE", "sku": "SRV-AMC-001", "cost": 3000, "salesPrice": 7500, "stock": 999, "reorderPoint": 0, "material": "Service Warranty"},
        {"name": "Master Suite Complete Bedroom Ensemble", "category": "Combos", "type": "COMBO", "sku": "CMB-BED-001", "cost": 55000, "salesPrice": 105000, "stock": 8, "reorderPoint": 2, "material": "Complete Sheesham Suite"},
    ]
