"""Refresh assets/activity.json with daily GitHub and Kaggle activity counts.

Runs nightly from .github/workflows/activity.yml. Each source is merged into
the existing file, taking the higher count per day, so a failed fetch or an
API that only returns recent items never erases history.
"""
import datetime as dt
import json
import os
import sys
import urllib.request
from pathlib import Path

OUT = Path("assets/activity.json")
GITHUB_USER = "raunakdey-07"
KAGGLE_USER = os.environ.get("KAGGLE_USERNAME", "raunakdey07")
MAX_PAGES = 20


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
    """Competition submissions and notebook runs per day, from the official Kaggle API."""
    from kaggle.api.kaggle_api_extended import KaggleApi

    api = KaggleApi()
    api.authenticate()
    days: dict[str, int] = {}

    def field(obj, *names):
        # Attribute names differ across kaggle package versions (lastRunTime vs last_run_time).
        for name in names:
            value = getattr(obj, name, None)
            if value:
                return value
        return None

    def add(timestamp) -> None:
        if timestamp:
            day = str(timestamp)[:10]
            days[day] = days.get(day, 0) + 1

    for page in range(1, MAX_PAGES + 1):
        competitions = api.competitions_list(group="entered", page=page)
        if not competitions:
            break
        for comp in competitions:
            slug = str(field(comp, "ref", "url")).rstrip("/").split("/")[-1]
            for sub in api.competition_submissions(slug) or []:
                add(field(sub, "date", "date_submitted"))

    for page in range(1, MAX_PAGES + 1):
        kernels = api.kernels_list(user=KAGGLE_USER, page=page, page_size=100)
        if not kernels:
            break
        for kernel in kernels:
            add(field(kernel, "lastRunTime", "last_run_time"))

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
        except Exception as exc:  # keep the previous data for this source
            print(f"::warning::{name} fetch failed, keeping previous data: {exc}")
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
