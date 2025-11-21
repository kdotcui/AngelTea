# file: voice_ordering_demo.py
# Purpose: Voice demo with menu recommendations, price queries, and basic order placing.
# Usage:
#   1) brew install sox
#   2) pip install --upgrade openai
#   3) export OPENAI_API_KEY="sk-..."
#   4) python voice_ordering_demo.py
#
# Flow per round:
#   Enter -> record segment (auto stops on silence) -> STT -> Agent (with tools) -> TTS playback

import os, sys, subprocess, json, time, uuid, math
from datetime import datetime
from openai import OpenAI

# ---------- Config ----------
API_KEY = os.getenv("OPENAI_API_KEY")
if not API_KEY:
    sys.exit("Missing OPENAI_API_KEY. Run: export OPENAI_API_KEY='sk-...'")

client = OpenAI(api_key=API_KEY)

REC_CMD = [
    # Record mono 16kHz WAV from default mic. Auto stop on ~1s silence; hard cap 10s.
    "sox", "-d", "-c", "1", "-r", "16000", "input.wav",
    "silence", "1", "0.2", "1%", "1", "1.0", "1%",
    "trim", "0", "10"
]

SYSTEM_PROMPT = """You are a calm, helpful tea shop voice agent.
Your goals:
1) Recommend drinks briefly and clearly.
2) Answer prices accurately.
3) Place small orders (items, size, sugar, ice, quantity), then read back the order and total price for confirmation.
4) If the user asks unclear questions, ask a short follow-up.

Important behavior:
- Keep answers short (1–3 sentences).
- Confirm key details when placing orders (item, size, sugar, ice, quantity).
- Use the provided tools:
  - get_menu(query)
  - get_price(name, size)
  - place_order(items[])
Never invent items or prices that are not in the tool results.
If an item is not found, suggest close alternatives from the menu.
"""

# ---------- Tiny Menu Model ----------
# You can extend freely. Prices are USD. Size multipliers apply to base price.
MENU = {
    "Brown Sugar Milk Tea": {
        "category": "milk_tea",
        "base_price": 5.50,
        "sizes": {"small": 1.0, "medium": 1.2, "large": 1.4},
        "topsellers": True,
    },
    "Jasmine Green Tea": {
        "category": "tea",
        "base_price": 4.25,
        "sizes": {"small": 1.0, "medium": 1.15, "large": 1.3},
        "topsellers": True,
    },
    "Oolong Milk Tea": {
        "category": "milk_tea",
        "base_price": 5.25,
        "sizes": {"small": 1.0, "medium": 1.2, "large": 1.35},
        "topsellers": False,
    },
    "Taro Milk Tea": {
        "category": "milk_tea",
        "base_price": 5.75,
        "sizes": {"small": 1.0, "medium": 1.18, "large": 1.35},
        "topsellers": True,
    },
    "Passionfruit Green Tea": {
        "category": "fruit_tea",
        "base_price": 5.00,
        "sizes": {"small": 1.0, "medium": 1.2, "large": 1.4},
        "topsellers": False,
    },
}

# Simple sugar/ice textual options; agent will echo/confirm only.
VALID_SUGAR = {"0%","25%","50%","75%","100%"}
VALID_ICE = {"no ice","less ice","regular ice","extra ice"}

def _normalize_name(name: str) -> str:
    return (name or "").strip().lower()

def _find_item(name: str):
    key = _normalize_name(name)
    for item in MENU.keys():
        if _normalize_name(item) == key:
            return item
    # fuzzy: contains
    for item in MENU.keys():
        if key and key in _normalize_name(item):
            return item
    return None

def _price(name: str, size: str = None) -> float:
    item_key = _find_item(name)
    if not item_key:
        return None
    info = MENU[item_key]
    mult = 1.0
    if size:
        size_l = size.strip().lower()
        # map synonyms
        synonyms = {"s":"small","m":"medium","l":"large"}
        size_l = synonyms.get(size_l, size_l)
        if size_l not in info["sizes"]:
            return None
        mult = info["sizes"][size_l]
    return round(info["base_price"] * mult, 2)

def _menu_list(query: str = None):
    out = []
    q = (query or "").strip().lower()
    for name, meta in MENU.items():
        if not q or q in name.lower() or q in meta["category"]:
            out.append({
                "name": name,
                "category": meta["category"],
                "base_price": meta["base_price"],
                "sizes": list(meta["sizes"].keys()),
                "topseller": meta.get("topsellers", False)
            })
    # sort topsellers first
    out.sort(key=lambda x: (not x["topseller"], x["name"]))
    return out

def _calc_total(items: list):
    total = 0.0
    normalized_items = []
    for it in items:
        name = it.get("name","").strip()
        size = (it.get("size") or "medium").strip().lower()
        qty = int(it.get("qty") or 1)
        sugar = (it.get("sugar") or "100%").strip().lower()
        ice = (it.get("ice") or "regular ice").strip().lower()

        # sanitize / normalize
        if sugar not in {s.lower() for s in VALID_SUGAR}:
            sugar = "100%"
        if ice not in {i.lower() for i in VALID_ICE}:
            ice = "regular ice"

        price = _price(name, size)
        if price is None:
            return None, f"Item or size not found: {name} ({size})"

        line_total = round(price * qty, 2)
        total += line_total
        normalized_items.append({
            "name": _find_item(name), "size": size, "qty": qty,
            "sugar": sugar, "ice": ice, "unit_price": price, "line_total": line_total
        })
    total = round(total, 2)
    return {"items": normalized_items, "total": total}, None

# ---------- Tool Schemas ----------
TOOLS = [
    {
        "type": "function",
        "name": "get_menu",
        "description": "Return menu items; optionally filter by a query (name/category). Topsellers first.",
        "parameters": {
            "type": "object",
            "properties": {
                "query": {"type":"string", "description":"Filter by keyword (optional)."}
            }
        }
    },
    {
        "type": "function",
        "name": "get_price",
        "description": "Return price for a specific drink and optional size.",
        "parameters": {
            "type": "object",
            "properties": {
                "name": {"type":"string", "description":"Drink name (e.g., Brown Sugar Milk Tea)."},
                "size": {"type":"string", "description":"small|medium|large (optional)"}
            },
            "required": ["name"]
        }
    },
    {
        "type": "function",
        "name": "place_order",
        "description": "Place a simple order. Returns normalized items, unit prices, line totals, and grand total.",
        "parameters": {
            "type": "object",
            "properties": {
                "items": {
                    "type": "array",
                    "items": {
                        "type":"object",
                        "properties": {
                            "name":{"type":"string"},
                            "size":{"type":"string", "description":"small|medium|large"},
                            "qty":{"type":"integer"},
                            "sugar":{"type":"string", "description":"0%|25%|50%|75%|100%"},
                            "ice":{"type":"string", "description":"no/less/regular/extra ice"}
                        },
                        "required": ["name"]
                    }
                }
            },
            "required": ["items"]
        }
    }
]

# ---------- Tool Implementations ----------
def tool_get_menu(query=None):
    return {"items": _menu_list(query)}

def tool_get_price(name, size=None):
    p = _price(name, size)
    if p is None:
        # suggest nearest
        suggestion = _find_item(name)
        return {"found": False, "price": None, "suggestion": suggestion}
    return {"found": True, "price": p}

def tool_place_order(items):
    calculated, err = _calc_total(items)
    if err:
        return {"ok": False, "error": err}
    order_id = str(uuid.uuid4())[:8]
    calculated["order_id"] = order_id
    calculated["currency"] = "USD"
    return {"ok": True, **calculated}

# ---------- Core Loop: record -> STT -> agent (tools) -> TTS ----------
def record_once():
    print("Recording... speak now; pause ~1s to auto-stop.")
    rec = subprocess.run(REC_CMD)
    if rec.returncode != 0:
        print("Recording failed. Check mic permissions (System Settings → Privacy & Security → Microphone).")
        return False
    return True

def transcribe():
    with open("input.wav","rb") as f:
        r = client.audio.transcriptions.create(
            model="gpt-4o-mini-transcribe",
            file=f,
        )
    return (r.text or "").strip()

def agent_reply(user_text: str) -> str:
    """
    One-shot agent pass with function calling. Supports a small chain:
    - model may request multiple tool calls; we execute then feed back.
    - we cap at 3 tool rounds for safety.
    """
    messages = [
        {"role":"system","content": SYSTEM_PROMPT},
        {"role":"user","content": user_text}
    ]

    # First request (allow tools)
    resp = client.responses.create(
        model="gpt-4.1-mini",
        input=messages,
        tools=TOOLS
    )

    # Process up to 3 tool rounds
    tool_rounds = 0
    while True:
        tool_calls = []
        final_text_chunks = []

        for out in resp.output:
            if out.type == "tool_call":
                tool_calls.append(out)
            elif out.type == "message":
                for c in out.content:
                    if c.type == "output_text":
                        final_text_chunks.append(c.text)

        if tool_calls and tool_rounds < 3:
            # Execute tools and feed back tool_result blocks
            tool_results_blocks = []
            for tc in tool_calls:
                name = tc.name
                args = dict(tc.parameters or {})
                result = {"error": f"unknown tool: {name}"}
                try:
                    if name == "get_menu":
                        result = tool_get_menu(**args)
                    elif name == "get_price":
                        result = tool_get_price(**args)
                    elif name == "place_order":
                        result = tool_place_order(**args)
                except Exception as e:
                    result = {"error": str(e)}

                tool_results_blocks.append({
                    "type": "tool_result",
                    "tool_call_id": tc.id,
                    "content": [{"type":"output_text","text": json.dumps(result)}]
                })

            # Next pass: include original messages + tool results
            resp = client.responses.create(
                model="gpt-4.1-mini",
                input=[*messages, *tool_results_blocks]
            )
            tool_rounds += 1
            # continue loop to see if model wants more tools
            continue

        # No tool calls: return final text (fallback if empty)
        final_text = "".join(final_text_chunks).strip() if final_text_chunks else ""
        if not final_text:
            final_text = "I didn't catch that—could you please repeat your question?"
        return final_text

def speak(text: str):
    audio = client.audio.speech.create(
        model="gpt-4o-mini-tts",
        voice="alloy",
        input=text
    )
    with open("reply.mp3","wb") as f:
        f.write(audio.read())
    subprocess.run(["afplay" if sys.platform=="darwin" else "play", "reply.mp3"])

def main():
    print("\nVoice Ordering Demo (English)")
    print("Press Enter each round. Speak, then pause ~1s; it will transcribe, answer, and speak back.")
    print("Try: 'What do you recommend?', 'How much is a large Brown Sugar Milk Tea?',")
    print("'I want two medium Jasmine Green Teas, 50% sugar, less ice.'\n")
    round_id = 1
    try:
        while True:
            input(f"[Round {round_id}] Press Enter to record...")
            ok = record_once()
            if not ok:
                continue
            text = transcribe()
            print("You:", text or "(empty)")
            if not text:
                continue
            answer = agent_reply(text)
            print("Agent:", answer)
            speak(answer)
            round_id += 1
    except KeyboardInterrupt:
        print("\nBye!")

if __name__ == "__main__":
    main()
