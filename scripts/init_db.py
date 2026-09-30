"""
Local dev bootstrap: creates all tables directly from the SQLAlchemy models
(NOT for production — production must use Alembic migrations) and, unless
skipped, seeds the learning-path content so /api/learning/levels isn't empty.

Run:
    python scripts/init_db.py
    python scripts/init_db.py --no-seed
"""
from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app.core.db import init_db_dev_only  # noqa: E402


def main() -> None:
    Path("./data").mkdir(parents=True, exist_ok=True)
    Path("./uploads").mkdir(parents=True, exist_ok=True)

    print("[init_db] creating tables from models ...")
    init_db_dev_only()
    print("[init_db] done.")

    if "--no-seed" not in sys.argv:
        print("[init_db] seeding learning content ...")
        import runpy

        runpy.run_path(str(Path(__file__).resolve().parent / "seed_learning_content.py"), run_name="__main__")
        print("[init_db] seed done.")


if __name__ == "__main__":
    main()
