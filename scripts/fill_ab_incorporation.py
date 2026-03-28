#!/usr/bin/env python3
"""
Alberta Incorporation PDF Filler

Generates a filled Alberta government incorporation form from an
APPROVED SNAPSHOT in Supabase. The script refuses to generate from
non-approved records.

Usage:
    # From an approved snapshot (preferred)
    python fill_ab_incorporation.py --snapshot <snapshot_id> [--output <path>]

    # From an intake ID (resolves latest approved snapshot)
    python fill_ab_incorporation.py <intake_id> [--output <path>]

    # From a local JSON file (dev/testing only)
    python fill_ab_incorporation.py --json <data.json> [--output <path>]

    # Register the generated artifact back to Supabase
    python fill_ab_incorporation.py --snapshot <id> --register

Requires:
    pip install supabase pypdf reportlab pdfplumber
    SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables

IMPORTANT: This script is an INTERNAL tool. The Alberta form template
and field mapping are backend artifacts — never exposed to clients.
"""

import argparse
import copy
import hashlib
import json
import os
import sys
from datetime import date
from pathlib import Path

SKILL_DIR = Path(__file__).parent.parent / "mnt" / ".skills" / "skills" / "pdf"
FILL_SCRIPT = SKILL_DIR / "scripts" / "fill_pdf_form_with_annotations.py"
TEMPLATE_PDF = Path(__file__).parent / "templates" / "AB New Corp Application Form.pdf"
FIELDS_JSON = Path(__file__).parent / "ab_incorporation_fields.json"


def _get_supabase():
    try:
        from supabase import create_client
    except ImportError:
        print("ERROR: pip install supabase --break-system-packages")
        sys.exit(1)

    url = os.environ.get("SUPABASE_URL") or os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_KEY") or os.environ.get("SUPABASE_ANON_KEY")
    if not url or not key:
        print("ERROR: Set SUPABASE_URL and SUPABASE_SERVICE_KEY env vars")
        sys.exit(1)

    return create_client(url, key)


def _hash_payload(payload: dict) -> str:
    """SHA-256 of JSON-serialized payload with sorted keys — matches TypeScript hashPayload()."""
    json_str = json.dumps(payload, sort_keys=True)
    return hashlib.sha256(json_str.encode()).hexdigest()


def load_from_snapshot(snapshot_id: str) -> tuple[dict, dict]:
    """Fetch snapshot payload. Verifies hash integrity. Returns (payload, snapshot_meta)."""
    sb = _get_supabase()
    result = sb.table("approved_snapshots").select("*").eq("id", snapshot_id).single().execute()
    snap = result.data
    if not snap:
        print(f"ERROR: Snapshot {snapshot_id} not found")
        sys.exit(1)

    # Verify payload hash integrity if present
    stored_hash = snap.get("payload_hash")
    if stored_hash:
        computed = _hash_payload(snap["payload"])
        if computed != stored_hash:
            print(f"WARNING: Snapshot payload hash mismatch!")
            print(f"  Stored:   {stored_hash}")
            print(f"  Computed: {computed}")
            print("  The snapshot payload may have been tampered with.")
            sys.exit(1)
        print(f"Snapshot integrity verified (hash: {stored_hash[:12]}...)")

    return snap["payload"], snap


def load_from_intake(intake_id: str) -> tuple[dict, dict]:
    """Resolve latest approved snapshot for an intake. Refuses non-approved."""
    sb = _get_supabase()

    # Check intake status
    intake = sb.table("incorporation_intakes").select("status, matter_id").eq("id", intake_id).single().execute().data
    if not intake:
        print(f"ERROR: Intake {intake_id} not found")
        sys.exit(1)

    approved_statuses = {"approved_for_generation", "generated", "filed"}
    if intake["status"] not in approved_statuses:
        print(f"ERROR: Intake status is '{intake['status']}' — must be approved before generation")
        print("Only approved snapshots can be used to generate filing documents.")
        sys.exit(1)

    # Get latest snapshot
    result = sb.table("approved_snapshots").select("*").eq("intake_id", intake_id).order("version", desc=True).limit(1).execute()
    if not result.data:
        print(f"ERROR: No approved snapshot found for intake {intake_id}")
        print("An admin must approve the intake before generation.")
        sys.exit(1)

    snap = result.data[0]
    return snap["payload"], snap


def load_from_json(path: str) -> tuple[dict, dict]:
    with open(path) as f:
        data = json.load(f)
    return data, {"id": "local-dev", "version": 0, "intake_id": "local", "matter_id": "local"}


def register_artifact(snapshot_meta: dict, output_path: str):
    """Write artifact metadata back to Supabase."""
    sb = _get_supabase()

    # Get current user (service key = admin)
    # For service key, we'll use a placeholder — in practice the admin user ID
    # would come from the session, but CLI scripts use the service key.
    generated_by = snapshot_meta.get("approved_by", "00000000-0000-0000-0000-000000000000")

    # Get next version for this artifact type
    existing = sb.table("generated_artifacts").select("version").eq(
        "snapshot_id", snapshot_meta["id"]
    ).eq("artifact_type", "alberta_incorporation_pdf").order("version", desc=True).limit(1).execute()

    next_version = (existing.data[0]["version"] + 1) if existing.data else 1

    # Supersede previous versions
    sb.table("generated_artifacts").update({"status": "superseded"}).eq(
        "intake_id", snapshot_meta["intake_id"]
    ).eq("artifact_type", "alberta_incorporation_pdf").eq("status", "generated").execute()

    # Compute snapshot hash for the artifact record
    snapshot_hash = snapshot_meta.get("payload_hash") or _hash_payload(snapshot_meta.get("payload", {}))

    # Insert new artifact
    artifact = sb.table("generated_artifacts").insert({
        "matter_id": snapshot_meta["matter_id"],
        "intake_id": snapshot_meta["intake_id"],
        "snapshot_id": snapshot_meta["id"],
        "artifact_type": "alberta_incorporation_pdf",
        "version": next_version,
        "file_path": str(output_path),
        "snapshot_hash": snapshot_hash,
        "generated_by": generated_by,
        "status": "generated",
    }).select("*").single().execute()

    # Update intake status to generated
    sb.table("incorporation_intakes").update({"status": "generated"}).eq("id", snapshot_meta["intake_id"]).execute()
    sb.table("commercialization_matters").update({"status": "generated"}).eq("id", snapshot_meta["matter_id"]).execute()

    # Log status event
    sb.table("matter_status_events").insert({
        "matter_id": snapshot_meta["matter_id"],
        "intake_id": snapshot_meta["intake_id"],
        "from_status": "approved_for_generation",
        "to_status": "generated",
        "changed_by": generated_by,
        "note": f"PDF generated (v{next_version}) from snapshot v{snapshot_meta['version']}",
    }).execute()

    print(f"Artifact registered: v{next_version} (ID: {artifact.data['id']})")
    return artifact.data


def map_to_fields(data: dict) -> dict:
    """Map normalized intake record to flat field keys for the Alberta PDF."""
    agent = data.get("agent") or {}
    directors = data.get("directors") or []
    declarant = data.get("declarant") or {}
    custom = data.get("custom_articles") or {}
    articles = data.get("articles_choice", "default")

    m = {}

    # Section 1 — Name
    m["full_corp_name"] = f"{data.get('proposed_name', '')} {data.get('legal_element', 'Ltd.')}".strip()

    # Section 2 — Address
    m["reg_street"] = data.get("reg_street", "")
    m["reg_city"] = data.get("reg_city", "")
    m["reg_province"] = data.get("reg_province", "Alberta")
    m["reg_postal_code"] = data.get("reg_postal_code", "")

    same = data.get("mailing_same_as_reg", True)
    m["mailing_same_checkbox"] = "X" if same else ""
    m["mail_po_box"] = "" if same else data.get("mail_po_box", "")
    m["mail_city"] = "" if same else data.get("mail_city", "")
    m["mail_province"] = "" if same else data.get("mail_province", "")
    m["mail_postal_code"] = "" if same else data.get("mail_postal_code", "")

    # Section 3 — Agent
    m["agent_last_name"] = agent.get("last_name", "")
    m["agent_first_name"] = agent.get("first_name", "")
    m["agent_firm"] = agent.get("firm", "")
    m["agent_email"] = agent.get("email", "")
    m["agent_street"] = agent.get("street", "")
    m["agent_city"] = agent.get("city", "")
    m["agent_province"] = agent.get("province", "Alberta")
    m["agent_postal_code"] = agent.get("postal_code", "")

    # Section 4 — Directors
    structure = data.get("director_structure", "fixed")
    if structure == "fixed":
        m["director_fixed_number"] = str(data.get("director_fixed_number", 1))
        m["director_min"] = ""
        m["director_max"] = ""
    else:
        m["director_fixed_number"] = ""
        m["director_min"] = str(data.get("director_min", 1))
        m["director_max"] = str(data.get("director_max", 15))

    for i, d in enumerate(directors[:2]):
        n = i + 1
        m[f"dir{n}_last_name"] = d.get("last_name", "")
        m[f"dir{n}_first_name"] = d.get("first_name", "")
        m[f"dir{n}_middle_name"] = d.get("middle_name", "")
        m[f"dir{n}_street"] = d.get("street", "")
        m[f"dir{n}_city"] = d.get("city", "")
        m[f"dir{n}_province"] = d.get("province", "Alberta")
        m[f"dir{n}_postal_code"] = d.get("postal_code", "")

    for n in range(len(directors) + 1, 3):
        for suffix in ["last_name", "first_name", "middle_name", "street", "city", "province", "postal_code"]:
            m[f"dir{n}_{suffix}"] = ""

    # Section 5 — Articles
    m["articles_default"] = "X" if articles == "default" else ""
    m["articles_own"] = "X" if articles == "provided_own" else ""
    m["articles_custom"] = "X" if articles == "custom" else ""

    if articles == "custom":
        m["share_classes"] = custom.get("share_classes", "")
        m["transfer_restrictions"] = custom.get("transfer_restrictions", "")
        m["director_details"] = (
            f"Fixed: {m['director_fixed_number']}" if structure == "fixed"
            else f"Min: {m['director_min']}, Max: {m['director_max']}"
        )
        m["business_restrictions"] = custom.get("business_restrictions", "")
        m["other_provisions"] = custom.get("other_provisions", "")
    else:
        for k in ["share_classes", "transfer_restrictions", "director_details", "business_restrictions", "other_provisions"]:
            m[k] = ""

    # Section 6 — Declarant
    m["declarant_name"] = declarant.get("full_name", "")
    m["declarant_date"] = date.today().isoformat()
    m["declarant_phone"] = declarant.get("phone", "")
    m["declarant_email"] = declarant.get("email", "")
    m["declarant_id"] = declarant.get("id_type", "")

    return m


def build_fields_json(field_values: dict, output_path: Path) -> Path:
    with open(FIELDS_JSON) as f:
        template = json.load(f)

    filled = copy.deepcopy(template)
    for field in filled["form_fields"]:
        key = field.get("schema_key", "")
        val = field_values.get(key, "")
        if val:
            field["entry_text"]["text"] = val

    filled["form_fields"] = [f for f in filled["form_fields"] if f["entry_text"].get("text")]

    out = output_path.with_suffix(".fields.json")
    with open(out, "w") as f:
        json.dump(filled, f, indent=2)
    return out


def main():
    parser = argparse.ArgumentParser(description="Fill Alberta Incorporation PDF (internal tool)")
    parser.add_argument("intake_id", nargs="?", help="Supabase intake record UUID")
    parser.add_argument("--snapshot", dest="snapshot_id", help="Approved snapshot UUID (preferred)")
    parser.add_argument("--json", dest="json_file", help="Local JSON data file (dev only)")
    parser.add_argument("--output", "-o", default=None, help="Output PDF path")
    parser.add_argument("--template", "-t", default=None, help="Template PDF path")
    parser.add_argument("--register", action="store_true", help="Register artifact back to Supabase")
    args = parser.parse_args()

    # Load data
    if args.json_file:
        data, snap_meta = load_from_json(args.json_file)
    elif args.snapshot_id:
        data, snap_meta = load_from_snapshot(args.snapshot_id)
    elif args.intake_id:
        data, snap_meta = load_from_intake(args.intake_id)
    else:
        parser.error("Provide an intake_id, --snapshot <id>, or --json <file>")

    if not data:
        print("ERROR: No data found")
        sys.exit(1)

    corp_name = f"{data.get('proposed_name', 'unnamed')}_{data.get('legal_element', 'Ltd')}"
    safe_name = corp_name.replace(" ", "_").replace(".", "")

    template = Path(args.template) if args.template else TEMPLATE_PDF
    if not template.exists():
        template = Path("mnt/uploads/AB New Corp Application Form.pdf")
    if not template.exists():
        print(f"ERROR: Template PDF not found at {template}")
        sys.exit(1)

    output_pdf = Path(args.output) if args.output else Path(f"filled_{safe_name}.pdf")

    # Map and fill
    values = map_to_fields(data)
    populated = len([v for v in values.values() if v])
    print(f"Mapped {populated} fields from snapshot v{snap_meta.get('version', '?')}")

    fields_path = build_fields_json(values, output_pdf)

    # Run PDF fill
    if FILL_SCRIPT.exists():
        import subprocess
        result = subprocess.run(
            [sys.executable, str(FILL_SCRIPT), str(template), str(fields_path), str(output_pdf)],
            capture_output=True, text=True,
        )
        print(result.stdout)
        if result.returncode != 0:
            print("STDERR:", result.stderr)
            sys.exit(1)
        print(f"Filled PDF: {output_pdf}")
    else:
        print(f"Fill script not at {FILL_SCRIPT}")
        print(f"Run: python fill_pdf_form_with_annotations.py {template} {fields_path} {output_pdf}")

    # Register artifact
    if args.register and snap_meta.get("id") and snap_meta["id"] != "local-dev":
        register_artifact(snap_meta, str(output_pdf))
    elif args.register:
        print("Skipping registration (local/dev mode)")

    # Clean up temp fields JSON
    try:
        fields_path.unlink()
    except Exception:
        pass


if __name__ == "__main__":
    main()
