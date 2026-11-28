"""Refresh assets/activity.json with daily GitHub and Kaggle activity counts.

Runs nightly from .github/workflows/activity.yml. Each source is merged into
the existing file, taking the higher count per day, so a failed fetch or an
API that only returns recent items never erases history.
"""
import datetime as dt
import json
import os
import sys
import time
import urllib.request
from pathlib import Path

OUT = Path("assets/activity.json")
GITHUB_USER = "raunakdey-07"
KAGGLE_USER = os.environ.get("KAGGLE_USERNAME", "raunakdey07")
MAX_PAGES = 20
# Submissions only change while a competition runs, so finished ones are skipped once
# they are this many days past their deadline. Set KAGGLE_FULL=1 to read every one.
RECENT_DAYS = 14
FULL = os.environ.get("KAGGLE_FULL") == "1"


def github(since: dt.date, until: dt.date) -> dict[str, int]:
    """Daily contribution counts from the official GraphQL API (max one year per call)."""
    query = """query($u:String!,$f:DateTime!,$t:DateTime!){
      user(login:$u){contributionsCollection(from:$f,to:$t){
        contributionCalendar{weeks{contributionDays{date contributionCount}}}}}}"""
    body = json.dumps({
        "query": query,
        "variables": {"u": GITHUB_USER, "f": f"{since}T00:00:00Z", "t": f"{until}T23:59:59Z"},
    }).encode()
    req = urllib.request.Request(
        "https://api.github.com/graphql",
        data=body,
        headers={
            "Authorization": f"bearer {os.environ['GITHUB_TOKEN']}",
            "Content-Type": "application/json",
            "User-Agent": "portfolio-activity-refresh",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        payload = json.load(resp)
    if payload.get("errors"):
        raise RuntimeError(payload["errors"])
    weeks = payload["data"]["user"]["contributionsCollection"]["contributionCalendar"]["weeks"]
    return {d["date"]: d["contributionCount"] for w in weeks for d in w["contributionDays"] if d["contributionCount"]}


def kaggle() -> dict[str, int]:
    """Kaggle activity per day from the official API (kaggle 1.8+): competition
    submissions, notebook runs and dataset updates.

    Every call is retried when Kaggle rate-limits it, and a call that still fails
    is skipped rather than discarding the whole fetch. That is safe because
    main() keeps the higher count for each day."""
    from kaggle.api.kaggle_api_extended import KaggleApi

    api = KaggleApi()
    api.authenticate()
    days: dict[str, int] = {}
    seen = {"competitions": 0, "submissions": 0, "notebooks": 0, "datasets": 0, "skipped": 0}
    cutoff = dt.date.today() - dt.timedelta(days=RECENT_DAYS)

    def call(fn, *args, **kwargs):
        for wait in (30, 60, 120, None):
            try:
                return fn(*args, **kwargs)
            except Exception as exc:
                if wait is None or "429" not in str(exc):
                    raise
                print(f"kaggle: rate limited, retrying in {wait}s")
                time.sleep(wait)

    def items(response, attr: str) -> list:
        # 1.8 returns response objects for some calls and plain lists for others.
        if response is None:
            return []
        if isinstance(response, list):
            return response
        return list(getattr(response, attr, None) or [])

    def add(timestamp, kind: str) -> None:
        if timestamp:
            day = str(timestamp)[:10]
            days[day] = days.get(day, 0) + 1
            seen[kind] += 1

    def finished_long_ago(comp) -> bool:
        deadline = getattr(comp, "deadline", None)
        if FULL or not deadline:
            return False
        try:
            return dt.date.fromisoformat(str(deadline)[:10]) < cutoff
        except ValueError:
            return False

    # The API returns at most 20 competitions per page and no next-page token for this list,
    # so walk numbered pages until a page adds nothing new.
    competitions: dict[str, object] = {}
    for page in range(1, MAX_PAGES + 1):
        fresh = 0
        for comp in items(call(api.competitions_list, group="entered", page=page), "competitions"):
            slug = str(getattr(comp, "ref", "") or getattr(comp, "url", "")).rstrip("/").split("/")[-1]
            if slug and slug not in competitions:
                competitions[slug] = comp
                fresh += 1
        if fresh == 0:
            break

    for slug, comp in competitions.items():
        seen["competitions"] += 1
        if finished_long_ago(comp):
            seen["skipped"] += 1
            continue
        try:
            for sub in call(api.competition_submissions, slug) or []:
                add(getattr(sub, "date", None), "submissions")
        except Exception as exc:
            print(f"::warning::kaggle submissions for {slug} skipped: {type(exc).__name__}: {exc}")
        time.sleep(1)

    try:
        for page in range(1, MAX_PAGES + 1):
            kernels = items(call(api.kernels_list, user=KAGGLE_USER, page=page, page_size=100), "kernels")
            for kernel in kernels:
                add(getattr(kernel, "last_run_time", None), "notebooks")
            if len(kernels) < 100:
                break
    except Exception as exc:
        print(f"::warning::kaggle notebooks skipped: {type(exc).__name__}: {exc}")

    try:
        for page in range(1, MAX_PAGES + 1):
            datasets = items(call(api.dataset_list, user=KAGGLE_USER, page=page), "datasets")
            for dataset in datasets:
                add(getattr(dataset, "last_updated", None), "datasets")
            if len(datasets) < 20:
                break
    except Exception as exc:
        print(f"::warning::kaggle datasets skipped: {type(exc).__name__}: {exc}")

    print("kaggle: " + ", ".join(f"{v} {k}" for k, v in seen.items()))
    return days


def main() -> None:
    today = dt.date.today()
    since = today - dt.timedelta(days=364)
    data = json.loads(OUT.read_text()) if OUT.exists() else {"updated": {}, "github": {}, "kaggle": {}}

    sources = {"github": lambda: github(since, today), "kaggle": kaggle}
    succeeded = 0
    for name, fetch in sources.items():
        try:
            fresh = fetch()
        except (Exception, SystemExit) as exc:  # keep the previous data for this source
            print(f"::warning::{name} fetch failed, keeping previous data: {type(exc).__name__}: {exc}")
            continue
        succeeded += 1
        old = data.get(name, {})
        merged = {**old, **{d: max(c, old.get(d, 0)) for d, c in fresh.items()}}
        print(f"{name}: {len(fresh)} active days in this fetch")
        if merged != old:
            data[name] = dict(sorted(merged.items()))
            data.setdefault("updated", {})[name] = today.isoformat()

    if succeeded == 0:
        sys.exit("Both sources failed; activity.json left unchanged.")
    OUT.write_text(json.dumps(data, indent=1) + "\n")


if __name__ == "__main__":
    main()
