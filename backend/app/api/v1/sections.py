# app/api/v1/sections.py
from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from pydantic import BaseModel
from app.core import security
import os, json
from pathlib import Path

router = APIRouter()

DATA_DIR = os.environ.get("BACKEND_DATA_DIR", "/Users/naveen/ai-docs-platform/backend/app/data")
PROJECTS_FILE = os.path.join(DATA_DIR, "projects.json")
Path(DATA_DIR).mkdir(parents=True, exist_ok=True)

def _read_projects():
    try:
        with open(PROJECTS_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return {}

def _write_projects(d):
    with open(PROJECTS_FILE, "w") as f:
        json.dump(d, f, indent=2)

class PatchSectionIn(BaseModel):
    title: str | None = None
    content: str | None = None

class RefineIn(BaseModel):
    prompt: str

@router.patch("/{section_id}")
def patch_section(section_id: str, payload: PatchSectionIn, current_user: Dict = Depends(security.get_current_user_from_token)):
    projects = _read_projects()
    # find section across projects
    for pid, p in projects.items():
        sections = p.get("sections", [])
        for i, s in enumerate(sections):
            if str(s.get("id")) == str(section_id) or str(s.get("_id")) == str(section_id):
                if payload.title is not None:
                    s["title"] = payload.title
                if payload.content is not None:
                    s["content"] = payload.content
                projects[pid]["sections"][i] = s
                _write_projects(projects)
                return s
    raise HTTPException(status_code=404, detail="Section not found")

@router.post("/{section_id}/refine")
def refine_section(section_id: str, payload: RefineIn, current_user: Dict = Depends(security.get_current_user_from_token)):
    # Very simple stub: append the prompt as a "refinement" marker
    projects = _read_projects()
    for pid, p in projects.items():
        sections = p.get("sections", [])
        for i, s in enumerate(sections):
            if str(s.get("id")) == str(section_id) or str(s.get("_id")) == str(section_id):
                old = s.get("content", "")
                refined = old + "\n\n[Refined using prompt]: " + payload.prompt + "\n[Note: stubbed refine]"
                s["content"] = refined
                projects[pid]["sections"][i] = s
                _write_projects(projects)
                return {"content": refined}
    raise HTTPException(status_code=404, detail="Section not found")
