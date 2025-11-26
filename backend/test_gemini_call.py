# backend/test_gemini_call.py
from google import generativeai as genai
import os, traceback, sys

API_KEY = os.environ.get("GEMINI_API_KEY")
MODEL = os.environ.get("GEMINI_MODEL", "models/gemini-2.5-flash")

print("GEMINI_API_KEY present:", bool(API_KEY))
print("Using model:", MODEL)

try:
    genai.configure(api_key=API_KEY)
    print("genai.configure OK")
except Exception as e:
    print("configure() warning:", e)

print("\n--- Try genai.responder.respond(model=..., prompt=...) ---")
try:
    resp = genai.responder.respond(model=MODEL, prompt="Write one short paragraph about AI in education.")
    print("RESP type:", type(resp))
    print("RESP repr (first 1000 chars):\n", repr(resp)[:2000])
except Exception as e:
    print("responder.respond error:", e)
    traceback.print_exc()

print("\n--- Try genai.responder.respond(prompt_only) ---")
try:
    resp2 = genai.responder.respond("Write one short paragraph about AI in education.")
    print("RESP2 type:", type(resp2))
    print("RESP2 repr (first 1000 chars):\n", repr(resp2)[:2000])
except Exception as e:
    print("responder(prompt) error:", e)
    traceback.print_exc()

print("\n--- Try genai.get_model + calling advertised method names ---")
try:
    m = genai.get_model(MODEL)
    print("got model object repr:", repr(m)[:1000])
    # print available attrs
    print("model attrs:", [a for a in dir(m) if not a.startswith("_")][:80])
    # Try a few candidate methods if present
    for name in ("generateContent", "generate_content", "generate", "createCachedContent", "batchGenerateContent"):
        if hasattr(m, name):
            print(f"Model object has method: {name} — trying it...")
            fn = getattr(m, name)
            try:
                r = None
                # try both keyword and positional variations
                try:
                    r = fn(prompt="Write one short paragraph about AI in education.")
                except TypeError:
                    r = fn("Write one short paragraph about AI in education.")
                print(f"-> method {name} returned (repr):", repr(r)[:2000])
            except Exception:
                print(f"-> method {name} raised:")
                traceback.print_exc()
except Exception as e:
    print("get_model call error:", e)
    traceback.print_exc()

print("\n--- Done ---")
