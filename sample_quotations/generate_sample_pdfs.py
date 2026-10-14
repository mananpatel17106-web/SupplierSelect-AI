import os

def create_simple_pdf(filename, title, supplier, product, qty, unit_price, total_price, delivery_days, warranty_years, payment_terms):
    text_lines = [
        f"COMMERCIAL QUOTATION",
        f"====================",
        f"Supplier Name: {supplier}",
        f"Quotation Reference: QT-{os.path.basename(filename)[:4].upper()}-2026",
        f"Date: October 12, 2026",
        f"",
        f"LINE ITEM SPECIFICATIONS:",
        f"Product Name: {product}",
        f"Quantity: {qty} Units",
        f"Unit Price: ${unit_price:,.2f}",
        f"Total Price: ${total_price:,.2f}",
        f"",
        f"DELIVERY & COMMERCIAL TERMS:",
        f"Delivery Time: {delivery_days} days from purchase order",
        f"Warranty Duration: {warranty_years} years full comprehensive warranty",
        f"Payment Terms: {payment_terms}",
        f"",
        f"Authorized Signature:",
        f"Director of Procurement & Sales, {supplier}"
    ]

    # Create PDF content stream
    content_lines = ["BT", "/F1 12 Tf", "50 750 Td", "18 TL"]
    for i, line in enumerate(text_lines):
        # Escape parenthesis
        safe_line = line.replace("(", "\\(").replace(")", "\\)")
        content_lines.append(f"({safe_line}) '")
    content_lines.append("ET")
    content_stream = "\n".join(content_lines).encode("latin1")

    # Assemble PDF objects
    obj1 = b"<< /Type /Catalog /Pages 2 0 R >>"
    obj2 = b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>"
    obj3 = (
        b"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] "
        b"/Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>"
    )
    obj4 = f"<< /Length {len(content_stream)} >>\nstream\n".encode("latin1") + content_stream + b"\nendstream"
    obj5 = b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"

    objects = [obj1, obj2, obj3, obj4, obj5]
    
    pdf_bytes = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = []

    for idx, obj in enumerate(objects, 1):
        offsets.append(len(pdf_bytes))
        pdf_bytes.extend(f"{idx} 0 obj\n".encode("latin1"))
        pdf_bytes.extend(obj)
        pdf_bytes.extend(b"\nendobj\n")

    xref_offset = len(pdf_bytes)
    pdf_bytes.extend(b"xref\n0 6\n0000000000 65535 f \n")
    for off in offsets:
        pdf_bytes.extend(f"{off:010d} 00000 n \n".encode("latin1"))

    pdf_bytes.extend(
        f"trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n{xref_offset}\n%%EOF\n".encode("latin1")
    )

    with open(filename, "wb") as f:
        f.write(pdf_bytes)
    print(f"Generated: {filename} ({len(pdf_bytes)} bytes)")

os.makedirs("sample_quotations", exist_ok=True)

# 1. Apex Industrial (Competitive, lowest price)
create_simple_pdf(
    "sample_quotations/Apex_Industrial_Quotation.pdf",
    "Commercial Quotation - Apex Industrial",
    "Apex Industrial Solutions Ltd",
    "Industrial Centrifugal Pump CP-500",
    20,
    1150.00,
    23000.00,
    20,
    2,
    "Net 30 days upon inspection"
)

# 2. BlueWave Engineering (Fastest delivery, higher warranty)
create_simple_pdf(
    "sample_quotations/BlueWave_Engineering_Quotation.pdf",
    "Commercial Quotation - BlueWave Engineering",
    "BlueWave Engineering Corp",
    "Industrial Centrifugal Pump CP-500",
    20,
    1350.00,
    27000.00,
    14,
    3,
    "Net 30 days upon delivery"
)

# 3. GlobalTech Machinery (Non-compliant: exceeds max budget $1,500 and delivery 30 days)
create_simple_pdf(
    "sample_quotations/GlobalTech_Machinery_Quotation.pdf",
    "Commercial Quotation - GlobalTech Machinery",
    "GlobalTech Machinery Group",
    "Industrial Centrifugal Pump CP-500",
    20,
    1750.00,
    35000.00,
    45,
    1,
    "50% advance, balance Net 15"
)
