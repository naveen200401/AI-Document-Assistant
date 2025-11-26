"""
HTTP-based Gemini (Google Generative) client using httpx.

Usage:
- Save this file as app/services/llm_client.py (replace existing).
- Ensure backend/.env contains LLM_API_KEY (the Google API key / OAuth bearer token).
- Restart the backend.

Notes:
- The Google Generative API has several endpoint shapes; this implementation
  tries the common `generateText` REST endpoint: 
    https://generativelanguage.googleapis.com/v1/models/{model}:generateText
  It will attempt both Authorization: Bearer and ?key=... styles.
- If you prefer the SDK instead of REST, tell me and I can provide the SDK version.
"""

import os
import asyncio
from typing import Optional, Any, Dict

import httpx
from app.core.config import settings

MODEL_NAME = os.getenv("MODEL_NAME", "gemini-1.5-flash")
LLM_API_KEY = settings.LLM_API_KEY or os.getenv("LLM_API_KEY")

# Basic httpx client settings
_TIMEOUT = httpx.Timeout(30.0, read=60.0)
_MAX_RETRIES = 2
_BASE_ENDPOINT = "https://generativelanguage.googleapis.com/v1"

if not LLM_API_KEY:
    # We'll allow import but runtime functions will raise helpful error
    _HAS_KEY = False
else:
    _HAS_KEY = True


def _extract_text_from_resp_json(json_data: Dict[str, Any]) -> str:
    """
    Try common response shapes for the Generative API and return best-effort text.
    """
    # Common shape: {'candidates': [{'content': '...'}], ...}
    try:
        if isinstance(json_data, dict):
            # new style: maybe 'candidates' top-level
            if "candidates" in json_data and isinstance(json_data["candidates"], (list, tuple)):
                first = json_data["candidates"][0]
                if isinstance(first, dict):
                    for k in ("content", "text", "output"):
                        if k in first and isinstance(first[k], str):
                            return first[k]
                    # fallback: stringify candidate
                    return str(first)
            # some responses use 'output' -> 'content'
            if "output" in json_data:
                out = json_data["output"]
                if isinstance(out, dict):
                    if "content" in out and isinstance(out["content"], str):
                        return out["content"]
                if isinstance(out, str):
                    return out
            # Some older endpoints put text in 'text' or 'response'
            for k in ("text", "response", "content"):
                if k in json_data and isinstance(json_data[k], str):
                    return json_data[k]
    except Exception:
        pass
    # Fallback: stringified JSON
    return str(json_data)


async def _post_with_retries(url: str, json_payload: dict, headers: dict, params: dict = None):
    """
    Perform POST with a small retry loop for transient errors.
    """
    last_exc = None
    for attempt in range(_MAX_RETRIES + 1):
        try:
            async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
                resp = await client.post(url, json=json_payload, headers=headers or {}, params=params or {})
                resp.raise_for_status()
                return resp.json()
        except httpx.HTTPStatusError as exc:
            # Non-2xx: return details for debugging (do not retry on 4xx except 429)
            status = exc.response.status_code
            if status >= 500 or status == 429:
                last_exc = exc
                await asyncio.sleep(0.5 * (attempt + 1))
                continue
            # return error body for immediate visibility
            raise RuntimeError(f"LLM HTTP error {status}: {exc.response.text}") from exc
        except Exception as exc:
            last_exc = exc
            # retry transient network issues
            await asyncio.sleep(0.5 * (attempt + 1))
            continue
    # If we get here, we failed all retries
    raise RuntimeError(f"LLM request failed after retries: {last_exc}") from last_exc


# Replace just the generate_section_content function with this (in app/services/llm_client.py)

async def generate_section_content(topic: str, section_title: str) -> str:
    """
    Generate content for a section using the Gemini REST endpoint.
    If the HTTP call fails (404 / other), return a safe stub so the app can continue.
    """
    if not _HAS_KEY:
        # no key → fallback to stub
        return f"(LLM stub) Generated content for section '{section_title}' on topic '{topic}'."

    prompt = (
        f"Write a clear, concise section for a business document.\n\n"
        f"Project topic: {topic}\n"
        f"Section title: {section_title}\n\n"
        f"Produce:\n- a short paragraph (3-6 sentences)\n- a short bullet list of 3 key points\n\n"
        f"Return only the content (no extra commentary)."
    )

    url = f"{_BASE_ENDPOINT}/models/{MODEL_NAME}:generateText"
    payload = {"prompt": {"text": prompt}}
    headers = {"Authorization": f"Bearer {LLM_API_KEY}"}

    try:
        json_resp = await _post_with_retries(url, payload, headers=headers, params=None)
    except Exception as e_header:
        # if the failure is a 404, return a helpful stub instead of failing hard
        err_msg = str(e_header)
        if "404" in err_msg or "Not Found" in err_msg:
            return f"(LLM stub due to 404) Generated content for section '{section_title}' on topic '{topic}'."
        # try key param fallback
        try:
            json_resp = await _post_with_retries(url, payload, headers={}, params={"key": LLM_API_KEY})
        except Exception as e_key:
            # if the second attempt also 404, return stub; otherwise propagate combined error
            err_msg2 = str(e_key)
            if "404" in err_msg2 or "Not Found" in err_msg2:
                return f"(LLM stub due to 404) Generated content for section '{section_title}' on topic '{topic}'."
            raise RuntimeError(f"LLM generation failed (header error: {e_header}; key-param error: {e_key})") from e_key

    text = _extract_text_from_resp_json(json_resp)
    return text


async def refine_section_content(current_text: str, prompt: Optional[str] = None) -> str:
    """
    Refine existing section content using a user-provided prompt.
    If the HTTP call fails (404/401/other), return a helpful stub so app can continue.
    """
    if not _HAS_KEY:
        # no key — fallback to stub
        return f"(LLM stub) Refined ({prompt or 'default'}): {current_text}"

    user_prompt = prompt or "Refine the text to be clearer and more professional."

    full_prompt = (
        f"You are an assistant that edits and refines document sections.\n\n"
        f"Instruction: {user_prompt}\n\n"
        f"Original section:\n{current_text}\n\n"
        f"Provide the refined section only (no commentary)."
    )

    url = f"{_BASE_ENDPOINT}/models/{MODEL_NAME}:generateText"
    payload = {"prompt": {"text": full_prompt}}
    headers = {"Authorization": f"Bearer {LLM_API_KEY}"}

    try:
        json_resp = await _post_with_retries(url, payload, headers=headers, params=None)
    except Exception as e_header:
        # if 404/Not Found or other transient, return a helpful stub instead of failing hard
        err_msg = str(e_header)
        if "404" in err_msg or "Not Found" in err_msg or "401" in err_msg or "Unauthorized" in err_msg:
            return f"(LLM stub due to LLM error) Refined ({user_prompt}): {current_text}"
        # try key param fallback
        try:
            json_resp = await _post_with_retries(url, payload, headers={}, params={"key": LLM_API_KEY})
        except Exception as e_key:
            err_msg2 = str(e_key)
            if "404" in err_msg2 or "Not Found" in err_msg2 or "401" in err_msg2 or "Unauthorized" in err_msg2:
                return f"(LLM stub due to LLM error) Refined ({user_prompt}): {current_text}"
            raise RuntimeError(f"LLM refine failed (header error: {e_header}; key-param error: {e_key})") from e_key

    text = _extract_text_from_resp_json(json_resp)
    return text
# add this function to your existing llm_client service
async def generate_full_document(prompt: str) -> str:
    """
    Call your LLM once to return the full document text.
    Return a single string (paragraphs can be separated by double newlines).
    """
    # adapt to your existing httpx usage; below is a simple pseudocode example:
    # payload = {"prompt": f"Write a structured document based on: {prompt}\n\nRequirements: ..."}
    # resp = await httpx.post(LLM_URL, json=payload, headers=...)
    # resp.raise_for_status()
    # data = resp.json()
    # return data["text"]  # adapt based on actual response schema

    # Example fallback stub (if network unavailable) — replace with real call:
    return (
        f"Title: Generated Document for: {prompt}\n\n"
        "Executive Summary\n\n"
        "This document provides an overview. Replace this stub with real LLM output.\n\n"
        "Details\n\n"
        "1) Point one\n\n2) Point two\n\nConclusion\n\nGenerated by LLM."
    )
# app/services/llm_client.py  (append or integrate)
import os
import httpx
import asyncio
from typing import Optional

from app.core.config import settings  # adjust if different

LLM_API_KEY = getattr(settings, "LLM_API_KEY", os.getenv("LLM_API_KEY", None))

# Choose model (change if you prefer different available model)
# If you're using Gemini, you might use a model string like "models/gemini-1.5" or similar;
# if that 404s, try "models/text-bison-001:generate" for Google's existing REST API example.
LLM_MODEL = getattr(settings, "LLM_MODEL", "models/text-bison-001")

# Helper: single-call to generate a full document text
async def generate_full_document(prompt: str, max_output_tokens: int = 1024) -> str:
    """
    Return a plain-text document generated by the LLM for the given prompt.
    This function calls the Google Generative Language HTTP endpoint with the API key.
    """
    if not LLM_API_KEY:
        raise RuntimeError("LLM_API_KEY is not configured")

    url = f"https://generativelanguage.googleapis.com/v1/{LLM_MODEL}:generate"

    payload = {
        "prompt": {
            "text": (
                "You are a helpful assistant that writes structured documents. "
                "Produce a human-readable document (plain text) for the user prompt below. "
                "Use paragraphs separated by double newlines. Include a short title/header at the top.\n\n"
                f"User prompt: {prompt}\n\n"
                "Requirements: produce clear headings and paragraphs. Keep output plain text."
            )
        },
        "maxOutputTokens": max_output_tokens,
        # you can add other model-specific parameters here (temperature, top_k, etc.)
    }

    headers = {"Content-Type": "application/json"}

    # Two common auth options:
    # 1) API key as query param: ?key=API_KEY
    # 2) Bearer token in header: Authorization: Bearer API_KEY
    # Many Google examples use the key query param; try that first.
    params = {"key": LLM_API_KEY}

    async with httpx.AsyncClient(timeout=30.0) as client:
        resp = await client.post(url, json=payload, headers=headers, params=params)
        resp.raise_for_status()
        j = resp.json()

    # Response schema differs across models / APIs.
    # Common field for Google GenAI: j['candidates'][0]['output'] or j['output']
    # Try several fallbacks to extract text:
    text = None
    # Attempt common shapes:
    if isinstance(j, dict):
        # new-style: j.get("candidates")[0]["output"]
        candidates = j.get("candidates")
        if candidates and isinstance(candidates, list) and len(candidates) > 0:
            c0 = candidates[0]
            # candidate may have 'output' or 'content' or 'text'
            text = c0.get("output") or c0.get("content") or c0.get("text")
        # older style: j.get("output", {}).get("text")
        if not text:
            out = j.get("output")
            if isinstance(out, dict):
                # some APIs place the text under 'text' or 'content'
                text = out.get("text") or out.get("content")
        # fallback: try top-level 'text' or 'result' keys
        if not text:
            text = j.get("text") or j.get("result") or j.get("generated_text")
    if not text:
        # last resort: stringify entire response (so you at least see something)
        text = repr(j)

    return text
