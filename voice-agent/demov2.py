# file: voice_ordering_demo.py
# Purpose: Voice demo with full Angel Tea menu, precise M/L pricing, toppings (+$0.80), and simple order placement.
# Usage:
#   1) brew install sox
#   2) pip install --upgrade openai
#   3) export OPENAI_API_KEY="sk-..."
#   4) python voice_ordering_demo.py
#
# Flow per round:
#   Enter -> record segment (auto stops on silence) -> STT -> Agent (with tools) -> TTS playback

import os, sys, subprocess, json, time, uuid
from typing import Optional
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
3) Place small orders (items, size=M/L, sugar, ice, toppings, quantity), then read back the order and total price for confirmation.
4) If the user asks unclear questions, ask a short follow-up.

Important behavior:
- Keep answers short (1–3 sentences).
- Confirm key details when placing orders (item, size, sugar, ice, toppings, quantity).
- Use the provided tools:
  - get_menu(query)
  - get_price(name, size, toppings)
  - place_order(items[])
- Sizes are M or L. Each added topping is +$0.80 unless the drink lists included toppings.
- Boba is not included unless the drink name states it or the user adds it as a topping.
- Never invent items or prices that are not in the tool results.
If an item is not found, suggest close alternatives from the menu.
"""

# ---------- Full Angel Tea Menu (explicit M/L pricing) ----------
# Conventions:
# - prices: dict with 'm' and 'l'
# - topseller: boolean for items marked with a star or ranking on the menu
# - included_toppings: toppings bundled at $0.00 for that drink (rare)

TOPPING_PRICE = 0.80

TOPPINGS = [
    "brown sugar boba", "coconut jelly", "herbal jelly", "sago",
    "oreo crumbs", "milk foam", "red bean", "chocolate",
    "mango popping bubbles", "green apple popping bubbles",
    "lychee popping bubbles", "blueberry popping bubbles",
    "strawberry popping bubbles"
]

TOPPING_SYNONYMS = {
    "boba": "brown sugar boba",
    "tapioca": "brown sugar boba",
    "pearls": "brown sugar boba",
    "milk cap": "milk foam",
    "cheese foam": "milk foam",
    "oreo": "oreo crumbs",
    "mango popping": "mango popping bubbles",
    "green apple popping": "green apple popping bubbles",
    "lychee popping": "lychee popping bubbles",
    "blueberry popping": "blueberry popping bubbles",
    "strawberry popping": "strawberry popping bubbles",
}

def _canon_topping(name: str):
    n = (name or "").strip().lower()
    if not n:
        return None
    if n in TOPPING_SYNONYMS:
        n = TOPPING_SYNONYMS[n]
    # fuzzy contains
    for t in TOPPINGS:
        if n == t or n in t or t in n:
            return t
    return None

MENU = {
    # ---------------- ANGEL MILK TEA ----------------
    "Angel Milk Tea": {"category":"milk_tea","prices":{"m":5.99,"l":6.89},"topseller": True},
    "Jasmine Milk Tea": {"category":"milk_tea","prices":{"m":5.99,"l":6.89}},
    "Coffee Milk Tea": {"category":"milk_tea","prices":{"m":6.59,"l":7.49}},
    "Taro Milk Tea": {"category":"milk_tea","prices":{"m":6.29,"l":7.19},"topseller": True},
    "Matcha Milk Tea": {"category":"milk_tea","prices":{"m":6.79,"l":7.69}},
    "THAI Milk Tea": {"category":"milk_tea","prices":{"m":6.29,"l":7.19}},
    "Oreo Milk Tea": {"category":"milk_tea","prices":{"m":6.59,"l":7.49},"topseller": True},
    "Mango Milk Tea": {"category":"milk_tea","prices":{"m":6.29,"l":7.19}},
    "Strawberry Milk Tea": {"category":"milk_tea","prices":{"m":6.29,"l":7.19}},
    "Lychee Jasmine Milk Tea": {"category":"milk_tea","prices":{"m":6.29,"l":7.19}},
    "Brown Sugar Bubble Tea": {"category":"milk_tea","prices":{"m":6.59,"l":7.49},"topseller": True,
                               "included_toppings":["brown sugar boba"]},
    "Milk Foam Caramel Milk Tea": {"category":"milk_tea","prices":{"m":7.39,"l":8.29},"topseller": True,
                                   "included_toppings":["milk foam"]},

    # ---------------- ANGEL FRUIT TEA ----------------
    "3 Brother 4 Season Spring Tea": {"category":"fruit_tea","prices":{"m":7.39,"l":8.29},"topseller": True,
                                      "included_toppings":["brown sugar boba","sago","coconut jelly"]},
    "Mango Passion Green Tea": {"category":"fruit_tea","prices":{"m":6.75,"l":7.69},"topseller": True},
    "Passion Fruit Green Tea": {"category":"fruit_tea","prices":{"m":6.25,"l":7.19}},
    "Bayberry Jasmine Green Tea": {"category":"fruit_tea","prices":{"m":6.25,"l":7.19}},
    "Pineapple Mango Green Tea": {"category":"fruit_tea","prices":{"m":6.75,"l":7.69}},
    "Peach Coconut Green Tea": {"category":"fruit_tea","prices":{"m":6.75,"l":7.69},"topseller": True},
    "Strawberry Pineapple Green Tea": {"category":"fruit_tea","prices":{"m":6.75,"l":7.69},"topseller": True},
    "Milk Foam Honey Peach Black Tea": {"category":"fruit_tea","prices":{"m":7.39,"l":8.29},
                                        "included_toppings":["milk foam"]},
    "Honey Lemon Black Tea": {"category":"fruit_tea","prices":{"m":6.49,"l":7.39}},
    "Chinese Sour Plum Drink": {"category":"fruit_tea","prices":{"m":5.99,"l":6.89}},

    # ---------------- LATTE SERIES ----------------
    "Strawberry Matcha Latte": {"category":"latte","prices":{"m":6.79,"l":7.69},
                                "included_toppings":["brown sugar boba","sago","coconut jelly"]},
    "Kiwi Matcha Latte": {"category":"latte","prices":{"m":6.79,"l":7.69}},
    "Peach Matcha Latte": {"category":"latte","prices":{"m":6.79,"l":7.69}},
    "Strawberry Ube Latte": {"category":"latte","prices":{"m":6.79,"l":7.69},
                             "included_toppings":["brown sugar boba","sago","coconut jelly"]},
    "Brown Sugar Bubble Latte": {"category":"latte","prices":{"m":6.59,"l":7.49},
                                 "included_toppings":["brown sugar boba"]},

    # ---------------- SAGO NECTAR (Caffeine Free) ----------------
    "Mango Pomelo Sago Nectar": {"category":"sago_nectar","prices":{"m":7.59,"l":8.49},"topseller": True},
    "Strawberry Sago Nectar": {"category":"sago_nectar","prices":{"m":7.59,"l":8.49},"topseller": True},
    "Pina Colada Sago Nectar": {"category":"sago_nectar","prices":{"m":7.59,"l":8.49}},
    "Peach Sago Nectar": {"category":"sago_nectar","prices":{"m":7.59,"l":8.49}},
    "Lychee Bayberry Sago Nectar": {"category":"sago_nectar","prices":{"m":7.59,"l":8.49}},

    # ---------------- SPARKLING (Caffeine Free, flavor variants) ----------------
    "Sparkling Strawberry": {"category":"sparkling","prices":{"m":7.39,"l":8.29},"topseller": True},
    "Sparkling Pineapple": {"category":"sparkling","prices":{"m":7.39,"l":8.29},"topseller": True},
    "Sparkling Mango": {"category":"sparkling","prices":{"m":7.39,"l":8.29}},
    "Sparkling Kiwi": {"category":"sparkling","prices":{"m":7.39,"l":8.29}},
    "Sparkling Passion Fruit": {"category":"sparkling","prices":{"m":7.39,"l":8.29}},
    "Sparkling Peach": {"category":"sparkling","prices":{"m":7.39,"l":8.29}},
    "Sparkling Bayberry": {"category":"sparkling","prices":{"m":7.39,"l":8.29}},
    "Sparkling Orange": {"category":"sparkling","prices":{"m":7.39,"l":8.29}},

    # ---------------- YOGURT SMOOTHIE (Caffeine Free, flavor variants) ----------------
    "Mango Yogurt Smoothie": {"category":"yogurt_smoothie","prices":{"m":7.69,"l":8.59}},
    "Strawberry Yogurt Smoothie": {"category":"yogurt_smoothie","prices":{"m":7.69,"l":8.59}},
    "Passion Fruit Yogurt Smoothie": {"category":"yogurt_smoothie","prices":{"m":7.69,"l":8.59}},
    "Lychee Yogurt Smoothie": {"category":"yogurt_smoothie","prices":{"m":7.69,"l":8.59}},
    "Pineapple Yogurt Smoothie": {"category":"yogurt_smoothie","prices":{"m":7.69,"l":8.59}},
    "Peach Yogurt Smoothie": {"category":"yogurt_smoothie","prices":{"m":7.69,"l":8.59}},
    "Bayberry Yogurt Smoothie": {"category":"yogurt_smoothie","prices":{"m":7.69,"l":8.59}},
    "Orange Yogurt Smoothie": {"category":"yogurt_smoothie","prices":{"m":7.69,"l":8.59}},
    "Kiwi Yogurt Smoothie": {"category":"yogurt_smoothie","prices":{"m":7.69,"l":8.59}},
    "Oreo Yogurt Smoothie": {"category":"yogurt_smoothie","prices":{"m":7.69,"l":8.59}},

    # ---------------- HERBAL HEALTH TEA ----------------
    "Chrysanthemum Goji Berry Cassia Tea": {"category":"herbal","prices":{"m":5.99,"l":7.79}},
    "Longan Rose Ginger Tea": {"category":"herbal","prices":{"m":5.99,"l":7.79}},
    "Jasmine Date Goji Berry Rose Tea": {"category":"herbal","prices":{"m":5.99,"l":7.79}},
    "Brown Sugar Date Ginger Tea": {"category":"herbal","prices":{"m":5.99,"l":7.79}},
    "Ginseng Mulberry Chrysanthemum Goji Berry Tea": {"category":"herbal","prices":{"m":5.99,"l":7.79}},

    # ---------------- MILK SLUSH (Caffeine Free, flavor variants) ----------------
    "Mango Milk Slush": {"category":"milk_slush","prices":{"m":6.69,"l":7.89}},
    "Passion Fruit Milk Slush": {"category":"milk_slush","prices":{"m":6.69,"l":7.89}},
    "Strawberry Milk Slush": {"category":"milk_slush","prices":{"m":6.69,"l":7.89}},
    "Lychee Milk Slush": {"category":"milk_slush","prices":{"m":6.69,"l":7.89}},
    "Pineapple Milk Slush": {"category":"milk_slush","prices":{"m":6.69,"l":7.89}},
    "Peach Milk Slush": {"category":"milk_slush","prices":{"m":6.69,"l":7.89}},
    "Bayberry Milk Slush": {"category":"milk_slush","prices":{"m":6.69,"l":7.89}},
    "Orange Milk Slush": {"category":"milk_slush","prices":{"m":6.69,"l":7.89}},
    "Kiwi Milk Slush": {"category":"milk_slush","prices":{"m":6.69,"l":7.89}},
    "Oreo Milk Slush": {"category":"milk_slush","prices":{"m":6.69,"l":7.89}},
    "Matcha Milk Slush": {"category":"milk_slush","prices":{"m":6.69,"l":7.89}},
    "Taro Milk Slush": {"category":"milk_slush","prices":{"m":6.69,"l":7.89}},
}

VALID_SUGAR = {"0%","25%","50%","75%","100%"}
VALID_ICE = {"no ice","less ice","regular ice","extra ice"}

def _normalize_name(name: str) -> str:
    return (name or "").strip().lower()

def _find_item(name: str):
    key = _normalize_name(name)
    for item in MENU.keys():
        if _normalize_name(item) == key:
            return item
    for item in MENU.keys():
        if key and key in _normalize_name(item):
            return item
    return None

def _price(name: str, size: str = None, toppings: list = None) -> Optional[float]:
    """Return price for name + size (M/L). If toppings provided, include topping charges."""
    item_key = _find_item(name)
    if not item_key:
        return None
    info = MENU[item_key]

    if not size:
        return None  # force caller to specify M/L for price accuracy
    size_l = size.strip().lower()
    size_map = {
        "m":"m", "medium":"m", "regular":"m", "s":"m", "small":"m",
        "l":"l", "large":"l"
    }
    if size_l not in size_map:
        return None
    size_key = size_map[size_l]

    base = info["prices"][size_key]

    # toppings
    included = set(t.lower() for t in info.get("included_toppings", []))
    tops = toppings or []
    extra_count = 0
    for t in tops:
        ct = _canon_topping(t)
        if not ct:
            continue
        if ct.lower() not in included:
            extra_count += 1
    return round(base + extra_count * TOPPING_PRICE, 2)

def _menu_list(query: str = None):
    out = []
    q = (query or "").strip().lower()
    for name, meta in MENU.items():
        if not q or q in name.lower() or q in meta["category"]:
            out.append({
                "name": name,
                "category": meta["category"],
                "prices": meta["prices"],
                "topseller": meta.get("topseller", False),
                "included_toppings": meta.get("included_toppings", [])
            })
    out.sort(key=lambda x: (not x["topseller"], x["category"], x["name"]))
    return out

def _calc_total(items: list):
    """
    items: [{name, size, qty, sugar, ice, toppings: [..]}]
    """
    total = 0.0
    normalized_items = []

    for it in items:
        name = it.get("name","").strip()
        size = (it.get("size") or "m").strip().lower()
        qty = int(it.get("qty") or 1)
        sugar = (it.get("sugar") or "100%").strip().lower()
        ice = (it.get("ice") or "regular ice").strip().lower()
        toppings = it.get("toppings") or []

        if sugar not in {s.lower() for s in VALID_SUGAR}:
            sugar = "100%"
        if ice not in {i.lower() for i in VALID_ICE}:
            ice = "regular ice"

        unit_price = _price(name, size, toppings=toppings)
        if unit_price is None:
            return None, f"Item or size not found: {name} ({size})"

        line_total = round(unit_price * qty, 2)
        total += line_total

        # canonicalize toppings for display
        canon_toppings = []
        for t in toppings:
            ct = _canon_topping(t)
            if ct: canon_toppings.append(ct)

        normalized_items.append({
            "name": _find_item(name),
            "size": {"m":"M","medium":"M","regular":"M","s":"M","small":"M","l":"L","large":"L"}.get(size, size).upper(),
            "qty": qty,
            "sugar": sugar,
            "ice": ice,
            "toppings": canon_toppings,
            "unit_price": unit_price,
            "line_total": line_total
        })

    total = round(total, 2)
    return {"items": normalized_items, "total": total}, None

# ---------- Tool Schemas ----------
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "get_menu",
            "description": "Return menu items; optionally filter by a query (name/category). Topsellers first.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type":"string", "description":"Filter by keyword (optional)."}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_price",
            "description": "Return price for a specific drink and size (M or L). Includes topping charges if provided.",
            "parameters": {
                "type": "object",
                "properties": {
                    "name": {"type":"string", "description":"Drink name, e.g., Brown Sugar Bubble Tea."},
                    "size": {"type":"string", "description":"M|L (required for accurate price)."},
                    "toppings": {"type":"array","items":{"type":"string"},
                                 "description":"Toppings to add (+$0.80 each)."}
                },
                "required": ["name"]
            }
        }
    },
    {
        "type": "function",
        "function": {
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
                                "size":{"type":"string", "description":"M|L"},
                                "qty":{"type":"integer"},
                                "sugar":{"type":"string", "description":"0%|25%|50%|75%|100%"},
                                "ice":{"type":"string", "description":"no/less/regular/extra ice"},
                                "toppings":{"type":"array","items":{"type":"string"},
                                            "description":"Toppings to add (+$0.80 each)."}
                            },
                            "required": ["name"]
                        }
                    }
                },
                "required": ["items"]
            }
        }
    }
]

# ---------- Tool Implementations ----------
def tool_get_menu(query=None):
    return {"items": _menu_list(query)}

def tool_get_price(name, size=None, toppings=None):
    p = _price(name, size, toppings=toppings)
    if p is None:
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

def agent_reply(conversation: list) -> str:
    """
    Agent with function calling support.
    - The model may request multiple tool calls; we execute then feed back.
    - Up to 3 tool rounds.
    conversation is mutated with assistant/tool messages so history persists.
    """
    tool_rounds = 0

    while True:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=conversation,
            tools=TOOLS,
            tool_choice="auto"
        )
        choice = resp.choices[0]
        message = choice.message

        assistant_msg = {"role": message.role, "content": message.content or ""}
        if message.tool_calls:
            tool_payloads = []
            for tc in message.tool_calls:
                tool_payloads.append({
                    "id": tc.id,
                    "type": tc.type,
                    "function": {
                        "name": tc.function.name,
                        "arguments": tc.function.arguments,
                    }
                })
            assistant_msg["tool_calls"] = tool_payloads
        conversation.append(assistant_msg)

        tool_calls = message.tool_calls or []
        if tool_calls:
            tool_rounds += 1
            if tool_rounds > 3:
                return "I didn't catch that—could you please repeat your question?"

            for tc in tool_calls:
                name = tc.function.name
                try:
                    args = json.loads(tc.function.arguments or "{}")
                except json.JSONDecodeError:
                    result = {"error": "invalid arguments"}
                else:
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

                conversation.append({
                    "role":"tool",
                    "tool_call_id": tc.id,
                    "content": json.dumps(result)
                })
            continue

        final_text = (message.content or "").strip()
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
    print("\nVoice Ordering Demo (Angel Tea)")
    print("Press Enter each round. Speak, then pause ~1s; it will transcribe, answer, and speak back.")
    print("Try examples like:")
    print("- 'What do you recommend?'")
    print("- 'How much is a large Brown Sugar Bubble Tea?'")
    print("- 'Two M Angel Milk Tea, 50% sugar, less ice; one L Mango Pomelo Sago Nectar with boba.'\n")
    round_id = 1
    conversation = [{"role":"system","content": SYSTEM_PROMPT}]
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
            conversation.append({"role":"user","content": text})
            answer = agent_reply(conversation)
            print("Agent:", answer)
            speak(answer)
            round_id += 1
    except KeyboardInterrupt:
        print("\nBye!")

if __name__ == "__main__":
    main()
