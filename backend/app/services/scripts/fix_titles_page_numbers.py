#!/usr/bin/env python3
# Run from backend folder with venv active:
# python scripts/fix_titles_page_numbers.py

from sqlalchemy import create_engine, text
import os
from app.core.config import settings

# Use same DATABASE_URL as backend settings
db_url = settings.DATABASE_URL.replace("+asyncpg", "")  # use sync driver for psql connection
engine = create_engine(db_url)

project_id = 2  # change if needed

with engine.connect() as conn:
    res = conn.execute(text("SELECT id, \"order\" FROM section WHERE project_id = :pid ORDER BY \"order\""), {"pid": project_id})
    rows = res.fetchall()
    for i, row in enumerate(rows, start=1):
        sec_id = row[0]
        new_title = f"Page {i}"
        conn.execute(text("UPDATE section SET title = :t WHERE id = :id"), {"t": new_title, "id": sec_id})
    conn.commit()
    print(f"Updated {len(rows)} sections in project {project_id} to Page X titles.")
