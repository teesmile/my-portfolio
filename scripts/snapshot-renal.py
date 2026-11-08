#!/usr/bin/env python3
"""Freezes what /work/renal-dosing-task needs into src/content/renal-dosing/snapshot.json.

The showcase must never read the task repository at runtime, so this copies a
static snapshot into the portfolio. It does not retype anything: it imports
the task's own simulator, grades every simulated agent with the task's own
pytest suite, and records the real failure messages pytest prints.

    pnpm snapshot:renal            # RENAL_TASK_DIR defaults to ~/projects/personal/renal-dosing-task

Needs uv (for the pinned pytest the task itself uses). Exits non-zero if the
snapshot disagrees with the task's committed evidence, so a stale or
inconsistent copy cannot be written quietly.
"""
from __future__ import annotations

import csv
import hashlib
import importlib.util
import json
import os
import re
import subprocess
import sys
import tempfile
from datetime import datetime
from pathlib import Path

TASK = Path(os.environ.get("RENAL_TASK_DIR", Path.home() / "projects/personal/renal-dosing-task")).resolve()
OUT = Path(__file__).resolve().parents[1] / "src/content/renal-dosing/snapshot.json"
ENV = TASK / "environment"
TESTS = TASK / "tests/test_outputs.py"
GT_PATH = TASK / "tests/ground_truth.json"

spec = importlib.util.spec_from_file_location("simulate_agents", TASK / "authoring/evidence/simulate_agents.py")
sim = importlib.util.module_from_spec(spec)
sys.modules["simulate_agents"] = sim
spec.loader.exec_module(sim)

# One featured patient per simulated mistake: the patient the task's own
# design table names for that trap. Every other patient a mistake changes is
# still listed on the page, under "also changed".
FEATURED = {
    "cr_umol_as_mgdl": "PT002",
    "cr_unit_by_magnitude": "PT004",
    "weight_lb_as_kg": "PT005",
    "weight_unit_by_magnitude": "PT007",
    "count_discontinued": "PT008",
    "freq_qNh_as_count": "PT009",
    "freq_bd_as_once": "PT010",
    "freq_tds_as_twice": "PT011",
    "lab_last_row_wins": "PT012",
    "flag_at_limit": "PT013",
}


def read_csv(path: Path) -> list[dict]:
    with path.open(newline="", encoding="utf-8") as fh:
        return list(csv.DictReader(fh))


def git(*args: str) -> str:
    return subprocess.run(["git", "-C", str(TASK), *args], capture_output=True, text=True, check=True).stdout.strip()


def walk(pid: str, opts: dict) -> dict:
    """The simulator's arithmetic for one patient, with every step kept.

    Mirrors sim.simulate() line for line; the result is checked against
    simulate() below, so this cannot drift from what was actually graded."""
    rules = json.loads((ENV / "rules.json").read_text(encoding="utf-8"))["drugs"]
    umol = opts.get("umol_factor", 88.4)
    lbf = opts.get("lb_factor", 0.45359237)

    labs = [r for r in read_csv(ENV / "labs.csv") if r["patient_id"] == pid]
    all_labs = read_csv(ENV / "labs.csv")
    chosen = None
    for i, r in enumerate(all_labs):
        if r["patient_id"] != pid:
            continue
        v, unit = float(r["creatinine"]), r["creatinine_unit"]
        mode = opts.get("cr_unit", "column")
        read_as = unit
        if mode == "ignore":
            read_as = "mg/dL"
        elif mode == "magnitude":
            read_as = "mg/dL" if v < 20 else "µmol/L"
        mg = v if read_as == "mg/dL" else v / umol
        key = i if opts.get("lab_pick") == "last_row" else datetime.fromisoformat(r["collected_at"])
        if chosen is None or key > chosen["key"]:
            chosen = {"key": key, "row": r, "read_as": read_as, "mg_dl": mg}

    p = next(r for r in read_csv(ENV / "patients.csv") if r["patient_id"] == pid)
    w, unit = float(p["weight"]), p["weight_unit"]
    mode = opts.get("wt_unit", "column")
    wt_read_as = unit
    if mode == "ignore":
        wt_read_as = "kg"
    elif mode == "magnitude":
        wt_read_as = "lb" if w > 140 else "kg"
    kg = w * lbf if wt_read_as == "lb" else w
    s = chosen["mg_dl"]
    crcl = (140 - int(p["age_years"])) * kg / (72 * s) * (0.85 if p["sex"] == "F" else 1.0)

    orders = []
    for o in read_csv(ENV / "meds.csv"):
        if o["patient_id"] != pid:
            continue
        counted = o["status"] == "active" or bool(opts.get("include_discontinued"))
        per = sim.per_day(o["frequency"], opts.get("freq_bug"))
        daily = float(o["dose_mg"]) * per
        band = next(b for b in rules[o["drug"]]
                    if (b["crcl_min"] is None or crcl >= b["crcl_min"])
                    and (b["crcl_max"] is None or crcl < b["crcl_max"]))
        limit = band["max_daily_dose_mg"]
        over = daily >= limit if opts.get("flag_ge") else daily > limit
        orders.append({
            "order_id": o["order_id"], "drug": o["drug"], "status": o["status"],
            "dose_mg": float(o["dose_mg"]), "frequency": o["frequency"], "per_day": per,
            "daily_mg": daily, "band": [band["crcl_min"], band["crcl_max"]], "limit_mg": limit,
            "counted": counted, "flagged": counted and over,
        })

    return {
        "weight": {"value": w, "unit": unit, "read_as": wt_read_as, "kg": round(kg, 2)},
        "creatinine": {"value": float(chosen["row"]["creatinine"]), "unit": chosen["row"]["creatinine_unit"],
                       "collected_at": chosen["row"]["collected_at"], "read_as": chosen["read_as"],
                       "mg_dl": round(s, 4), "labs_for_patient": len(labs)},
        "crcl_ml_min": round(crcl, 1),
        "orders": orders,
        "flagged_order_ids": sorted(o["order_id"] for o in orders if o["flagged"]),
    }


def pytest_failures(output: Path | None) -> tuple[bool, list[dict], str]:
    env = {**os.environ, "OUTPUT_PATH": str(output or "/nonexistent/dose_check.jsonl"),
           "GROUND_TRUTH_PATH": str(GT_PATH), "COLUMNS": "1000"}
    proc = subprocess.run([sys.executable, "-m", "pytest", "-q", "-rfE", "--tb=no", "-p", "no:cacheprovider", str(TESTS)],
                          env=env, capture_output=True, text=True, cwd=TASK)
    failures = []
    for line in proc.stdout.splitlines():
        m = re.match(r"^(FAILED|ERROR) \S+::(\S+)(?: - (.*))?$", line)
        if m:
            failures.append({"kind": m.group(1).lower(), "test": m.group(2), "message": (m.group(3) or "").strip()})
    tail = proc.stdout.strip().splitlines()[-1]
    return proc.returncode == 0, failures, tail


def function_source(name: str) -> str:
    text = TESTS.read_text(encoding="utf-8")
    m = re.search(rf"(@pytest\.mark[^\n]*\n)?def {name}\(.*?(?=\n\n\n|\n@|\Z)", text, re.S)
    if not m:
        raise SystemExit(f"could not find {name} in {TESTS}")
    return m.group(0).rstrip() + "\n"


def main() -> int:
    problems: list[str] = []
    gt = json.loads(GT_PATH.read_text(encoding="utf-8"))
    design = {d["patient_id"]: d for d in json.loads((TASK / "authoring/patient_design.json").read_text(encoding="utf-8"))}
    committed = json.loads((TASK / "authoring/evidence/results/simulation_results.json").read_text(encoding="utf-8"))
    agreement = json.loads((TASK / "authoring/evidence/results/independent_agreement.json").read_text(encoding="utf-8"))

    for name, digest in gt["input_sha256"].items():
        actual = hashlib.sha256((ENV / name).read_bytes()).hexdigest()
        if actual != digest:
            problems.append(f"{name} does not match the hash frozen in ground_truth.json")

    configs = {c.name: c for c in sim.CONFIGS}
    baseline = sim.simulate({}, ENV)
    agents = []
    with tempfile.TemporaryDirectory() as tmp:
        ref = Path(tmp) / "reference.jsonl"
        subprocess.run([sys.executable, str(TASK / "solution/solve.py"), str(ENV), str(ref)], check=True)
        runs = [("reference", "none", True, "solution/solve.py", ref, None)]
        for c in sim.CONFIGS:
            rows = sim.simulate(c.opts, ENV)
            out = Path(tmp) / f"{c.name}.jsonl"
            out.write_text("".join(json.dumps(r) + "\n" for r in rows))
            runs.append((c.name, c.family, c.expect_pass, c.description, out, rows))
        for kind, desc in sim.MALFORMED.items():
            out = Path(tmp) / f"{kind}.jsonl"
            text = sim.malformed_text(kind, baseline)
            if text is not None:
                out.write_text(text)
            runs.append((kind, "malformed", False, desc, out if text is not None else None, None))

        for name, family, expect_pass, desc, out, rows in runs:
            passed, failures, tail = pytest_failures(out)
            agents.append({"name": name, "family": family, "description": desc, "expect_pass": expect_pass,
                           "passed": passed, "pytest": tail, "failures": failures,
                           "changed": sim.diff_patients(rows, gt["patients"]) if rows else None})

    by_committed = {r["name"]: r for r in committed["results"]}
    for a in agents:
        c = by_committed.get(a["name"])
        if not c:
            problems.append(f"{a['name']} is not in the committed evidence")
            continue
        if c["passed"] != a["passed"] or c["failed_tests"] != len(a["failures"]):
            problems.append(f"{a['name']}: snapshot run disagrees with committed evidence "
                            f"({a['passed']}/{len(a['failures'])} vs {c['passed']}/{c['failed_tests']})")
        if a["passed"] != a["expect_pass"]:
            problems.append(f"{a['name']}: expected {'pass' if a['expect_pass'] else 'fail'}")

    traps = []
    for name, pid in FEATURED.items():
        c = configs[name]
        correct, careless = walk(pid, {}), walk(pid, c.opts)
        sim_row = next(r for r in sim.simulate(c.opts, ENV) if r["patient_id"] == pid)
        if (careless["crcl_ml_min"], careless["flagged_order_ids"]) != (sim_row["crcl_ml_min"], sorted(sim_row["flagged_order_ids"])):
            problems.append(f"{name}: step-by-step walk disagrees with the simulator for {pid}")
        want = gt["patients"][pid]
        if (correct["crcl_ml_min"], correct["flagged_order_ids"]) != (want["crcl_ml_min"], sorted(want["flagged_order_ids"])):
            problems.append(f"{name}: correct walk disagrees with ground truth for {pid}")
        agent = next(a for a in agents if a["name"] == name)
        traps.append({"mistake": name, "family": c.family, "mistake_description": c.description,
                      "patient_id": pid, "design_note": design[pid]["note"],
                      "correct": correct, "careless": careless,
                      "failures": agent["failures"], "also_changed": sorted(set(agent["changed"]) - {pid})})

    commit = git("rev-parse", "HEAD")
    snapshot = {
        "_notice": "Fictional drugs and limits, synthetic patients. Not clinical guidance. "
                   "Generated by scripts/snapshot-renal.py; do not edit by hand.",
        "source": {"repo": "https://github.com/teesmile/renal-dosing-task", "commit": commit,
                   "committed_at": git("show", "-s", "--format=%cs", commit),
                   "dirty": bool(git("status", "--porcelain")), "input_sha256": gt["input_sha256"]},
        "crcl_rel_tolerance": gt["crcl_rel_tolerance"],
        "rules": json.loads((ENV / "rules.json").read_text(encoding="utf-8"))["drugs"],
        "patients": read_csv(ENV / "patients.csv"),
        "labs": read_csv(ENV / "labs.csv"),
        "meds": read_csv(ENV / "meds.csv"),
        "ground_truth": gt["patients"],
        "design": design,
        "traps": traps,
        "agents": agents,
        "independent": {"compared": agreement["compared"], "rule": agreement["rule"],
                        "patients": len(agreement["patients"]),
                        "all_agree": all(p["agree"] for p in agreement["patients"])},
        "band_edge_margins": committed["band_edge_margins"],
        "families_by_patient": committed["families_by_patient"],
        "evidence_problems": committed["problems"],
        "test_source": {"clearance": function_source("test_clearance_within_one_percent"),
                        "flags": function_source("test_flagged_orders_exact")},
    }

    if problems:
        print("snapshot not written:\n  " + "\n  ".join(problems), file=sys.stderr)
        return 1

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"{OUT.relative_to(Path.cwd())} — commit {commit[:7]}, {len(agents)} agents graded, {len(traps)} traps")
    return 0


if __name__ == "__main__":
    sys.exit(main())
