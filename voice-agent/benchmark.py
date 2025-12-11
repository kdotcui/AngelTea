# Lightweight benchmark for the Angel Tea voice agent (Python demo).
# Runs a small set of text prompts through agent_reply() and checks the replies
# with simple string/regex assertions. Requires OPENAI_API_KEY and the
# dependencies used by continuous_demo.py.

import json
import os
import re
from pathlib import Path
import importlib.util
from typing import Callable, Dict, List, Tuple


Case = Dict[str, object]


def _load_agent_reply():
    """Dynamically load agent_reply from continuous_demo.py (no package install)."""
    here = Path(__file__).resolve().parent
    module_path = here / "continuous_demo.py"
    spec = importlib.util.spec_from_file_location("voice_agent_demo", module_path)
    if not spec or not spec.loader:
        raise RuntimeError("Failed to load continuous_demo.py")
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)  # type: ignore
    if not hasattr(mod, "agent_reply"):
        raise RuntimeError("agent_reply() not found in continuous_demo.py")
    return mod.agent_reply


def _text_has_all(text: str, phrases: List[str]) -> bool:
    text_l = text.lower()
    return all(p.lower() in text_l for p in phrases)


def _text_has_any(text: str, phrases: List[str]) -> bool:
    text_l = text.lower()
    return any(p.lower() in text_l for p in phrases)


def _price_in_text(text: str, amount: float) -> bool:
    # Match with 2 decimal places, e.g., 4.89 -> $4.89 or 4.89
    pattern = rf"\$?\s*{amount:.2f}"
    return re.search(pattern, text) is not None


def define_cases() -> List[Case]:
    cases = [
        {
            "name": "price_jasmine_medium",
            "prompt": "What's the price of a medium Jasmine Green Tea?",
            "checks": [
                lambda r: _text_has_any(r, ["jasmine", "green"]),
                lambda r: _price_in_text(r, 4.89),
            ],
        },
        {
            "name": "order_brown_sugar_two_large",
            "prompt": "Two large Brown Sugar Milk Tea, 50% sugar, less ice.",
            "checks": [
                lambda r: _text_has_all(r, ["brown sugar", "large", "50%", "less ice"]),
                lambda r: _price_in_text(r, 15.40),
            ],
        },
        {
            "name": "order_taro_one_large",
            "prompt": "One large Taro Milk Tea, 75% sugar, regular ice.",
            "checks": [
                lambda r: _text_has_all(r, ["taro", "large", "75%", "regular ice"]),
                lambda r: _price_in_text(r, 7.76),
            ],
        },
        {
            "name": "recommendation",
            "prompt": "What do you recommend?",
            "checks": [
                lambda r: _text_has_any(
                    r, ["brown sugar", "jasmine", "oolong", "taro", "passionfruit"]
                ),
            ],
        },
        {
            "name": "unknown_item",
            "prompt": "How much is a Dragon Fruit Yakult slush?",
            "checks": [
                lambda r: _text_has_any(r, ["not", "sorry", "can't find", "suggest"]),
            ],
        },
        {
            "name": "price_brown_large",
            "prompt": "What's the price of a large Brown Sugar Milk Tea?",
            "checks": [
                lambda r: _text_has_all(r, ["brown sugar", "large"]),
                lambda r: _price_in_text(r, 7.70),
            ],
        },
        {
            "name": "price_brown_medium",
            "prompt": "Price for a medium Brown Sugar Milk Tea?",
            "checks": [
                lambda r: _text_has_any(r, ["brown", "sugar"]),
                lambda r: _price_in_text(r, 6.60),
            ],
        },
        {
            "name": "price_jasmine_large",
            "prompt": "How much is a large Jasmine Green Tea?",
            "checks": [
                lambda r: _text_has_any(r, ["jasmine", "green"]),
                lambda r: _price_in_text(r, 5.53),
            ],
        },
        {
            "name": "price_oolong_small",
            "prompt": "Oolong Milk Tea small price?",
            "checks": [
                lambda r: _text_has_any(r, ["oolong", "small"]),
                lambda r: _price_in_text(r, 5.25),
            ],
        },
        {
            "name": "price_oolong_large",
            "prompt": "Oolong Milk Tea large price?",
            "checks": [
                lambda r: _text_has_any(r, ["oolong", "large"]),
                lambda r: _price_in_text(r, 7.09),
            ],
        },
        {
            "name": "price_passionfruit_medium",
            "prompt": "Price for a medium Passionfruit Green Tea?",
            "checks": [
                lambda r: _text_has_any(r, ["passionfruit", "green"]),
                lambda r: _price_in_text(r, 6.00),
            ],
        },
        {
            "name": "price_passionfruit_large",
            "prompt": "Price for a large Passionfruit Green Tea?",
            "checks": [
                lambda r: _text_has_any(r, ["passionfruit", "large"]),
                lambda r: _price_in_text(r, 7.00),
            ],
        },
        {
            "name": "price_taro_medium",
            "prompt": "How much is a medium Taro Milk Tea?",
            "checks": [
                lambda r: _text_has_any(r, ["taro", "medium"]),
                lambda r: _price_in_text(r, 6.79),
            ],
        },
        {
            "name": "order_oolong_two_medium",
            "prompt": "Two medium Oolong Milk Tea, 100% sugar, regular ice.",
            "checks": [
                lambda r: _text_has_all(r, ["oolong", "medium", "100%", "regular ice"]),
                lambda r: _price_in_text(r, 12.60),
            ],
        },
        {
            "name": "order_jasmine_three_small",
            "prompt": "Three small Jasmine Green Tea, 50% sugar, less ice.",
            "checks": [
                lambda r: _text_has_all(r, ["jasmine", "small", "50%", "less ice"]),
                lambda r: _price_in_text(r, 12.75),
            ],
        },
        {
            "name": "order_passionfruit_one_medium",
            "prompt": "One medium Passionfruit Green Tea, regular ice, 100% sugar.",
            "checks": [
                lambda r: _text_has_all(r, ["passionfruit", "medium", "regular ice"]),
                lambda r: _price_in_text(r, 6.00),
            ],
        },
        {
            "name": "order_mix_brown_medium_jasmine_small",
            "prompt": "One medium Brown Sugar Milk Tea, one small Jasmine Green Tea.",
            "checks": [
                lambda r: _text_has_any(r, ["brown sugar", "jasmine"]),
                lambda r: _price_in_text(r, 10.85),
            ],
        },
        {
            "name": "order_mix_taro_large_oolong_small",
            "prompt": "One large Taro Milk Tea and one small Oolong Milk Tea.",
            "checks": [
                lambda r: _text_has_any(r, ["taro", "oolong"]),
                lambda r: _price_in_text(r, 13.01),
            ],
        },
        {
            "name": "order_mix_brown_large_jasmine_medium_passionfruit_small",
            "prompt": "One large Brown Sugar Milk Tea, one medium Jasmine Green Tea, one small Passionfruit Green Tea.",
            "checks": [
                lambda r: _text_has_any(r, ["brown sugar", "jasmine", "passionfruit"]),
                lambda r: _price_in_text(r, 17.59),
            ],
        },
        {
            "name": "order_brown_small_no_ice",
            "prompt": "Small Brown Sugar Milk Tea, 0% sugar, no ice.",
            "checks": [
                lambda r: _text_has_all(r, ["brown sugar", "small", "0%", "no ice"]),
                lambda r: _price_in_text(r, 5.50),
            ],
        },
        {
            "name": "order_brown_letter_L",
            "prompt": "One L Brown Sugar Milk Tea.",
            "checks": [
                lambda r: _text_has_any(r, ["brown sugar", "large", "l"]),
                lambda r: _price_in_text(r, 7.70),
            ],
        },
        {
            "name": "order_jasmine_letter_M",
            "prompt": "One M Jasmine Green Tea.",
            "checks": [
                lambda r: _text_has_any(r, ["jasmine", "m", "medium"]),
                lambda r: _price_in_text(r, 4.89),
            ],
        },
        {
            "name": "order_taro_letter_S",
            "prompt": "One S Taro Milk Tea.",
            "checks": [
                lambda r: _text_has_any(r, ["taro", "small", "s"]),
                lambda r: _price_in_text(r, 5.75),
            ],
        },
        {
            "name": "order_oolong_letter_L",
            "prompt": "One L Oolong Milk Tea.",
            "checks": [
                lambda r: _text_has_any(r, ["oolong", "large", "l"]),
                lambda r: _price_in_text(r, 7.09),
            ],
        },
        {
            "name": "order_passionfruit_letter_M",
            "prompt": "One M Passionfruit Green Tea.",
            "checks": [
                lambda r: _text_has_any(r, ["passionfruit", "medium", "m"]),
                lambda r: _price_in_text(r, 6.00),
            ],
        },
        {
            "name": "price_brown_no_size",
            "prompt": "How much is Brown Sugar Milk Tea?",
            "checks": [
                lambda r: _text_has_any(r, ["brown sugar", "price"]),
                lambda r: _price_in_text(r, 5.50),
            ],
        },
        {
            "name": "price_brown_invalid_size_xl",
            "prompt": "What's the price of Brown Sugar Milk Tea XL?",
            "checks": [
                lambda r: _text_has_any(r, ["not", "size", "sorry", "find"]),
            ],
        },
        {
            "name": "order_invalid_item_tiger",
            "prompt": "I want a medium Tiger Milk Tea.",
            "checks": [
                lambda r: _text_has_any(r, ["not", "sorry", "can't", "suggest"]),
            ],
        },
        {
            "name": "order_passionfruit_four_large",
            "prompt": "Four large Passionfruit Green Tea, 100% sugar, regular ice.",
            "checks": [
                lambda r: _text_has_all(r, ["passionfruit", "large", "100%", "regular"]),
                lambda r: _price_in_text(r, 28.00),
            ],
        },
        {
            "name": "order_jasmine_five_small",
            "prompt": "Five small Jasmine Green Tea, 75% sugar, less ice.",
            "checks": [
                lambda r: _text_has_all(r, ["jasmine", "small", "75%", "less ice"]),
                lambda r: _price_in_text(r, 21.25),
            ],
        },
        {
            "name": "order_oolong_three_large",
            "prompt": "Three large Oolong Milk Tea, 50% sugar, regular ice.",
            "checks": [
                lambda r: _text_has_all(r, ["oolong", "large", "50%", "regular"]),
                lambda r: _price_in_text(r, 21.27),
            ],
        },
        {
            "name": "order_combo_three_sizes",
            "prompt": "One large Brown Sugar Milk Tea, one medium Taro Milk Tea, one small Jasmine Green Tea.",
            "checks": [
                lambda r: _text_has_any(r, ["brown sugar", "taro", "jasmine"]),
                lambda r: _price_in_text(r, 18.74),
            ],
        },
        {
            "name": "recommendation_topseller",
            "prompt": "Recommend your topsellers.",
            "checks": [
                lambda r: _text_has_any(r, ["brown sugar", "jasmine", "taro"]),
            ],
        },
        {
            "name": "recommendation_low_sugar",
            "prompt": "Recommend something good with low sugar.",
            "checks": [
                lambda r: _text_has_any(r, ["sugar", "0%", "25%", "50%"]),
            ],
        },
        {
            "name": "ask_menu_milk_tea",
            "prompt": "Show me your milk tea options.",
            "checks": [
                lambda r: _text_has_any(r, ["milk tea", "brown sugar", "oolong", "taro"]),
            ],
        },
        {
            "name": "ask_menu_fruit_tea",
            "prompt": "Show me your fruit tea options.",
            "checks": [
                lambda r: _text_has_any(r, ["fruit", "passionfruit"]),
            ],
        },
        {
            "name": "order_oolong_zero_sugar_no_ice_medium",
            "prompt": "One medium Oolong Milk Tea, 0% sugar, no ice.",
            "checks": [
                lambda r: _text_has_all(r, ["oolong", "medium", "0%", "no ice"]),
                lambda r: _price_in_text(r, 6.30),
            ],
        },
        {
            "name": "order_brown_75_sugar_extra_ice_medium",
            "prompt": "One medium Brown Sugar Milk Tea, 75% sugar, extra ice.",
            "checks": [
                lambda r: _text_has_all(r, ["brown sugar", "medium", "75%", "extra ice"]),
                lambda r: _price_in_text(r, 6.60),
            ],
        },
        {
            "name": "order_passionfruit_25_sugar_extra_ice_medium",
            "prompt": "One medium Passionfruit Green Tea, 25% sugar, extra ice.",
            "checks": [
                lambda r: _text_has_all(r, ["passionfruit", "medium", "25%", "extra ice"]),
                lambda r: _price_in_text(r, 6.00),
            ],
        },
        {
            "name": "price_taro_small",
            "prompt": "Price for a small Taro Milk Tea?",
            "checks": [
                lambda r: _text_has_any(r, ["taro", "small"]),
                lambda r: _price_in_text(r, 5.75),
            ],
        },
        {
            "name": "price_passionfruit_small",
            "prompt": "Price for a small Passionfruit Green Tea?",
            "checks": [
                lambda r: _text_has_any(r, ["passionfruit", "small"]),
                lambda r: _price_in_text(r, 5.00),
            ],
        },
        {
            "name": "price_jasmine_small",
            "prompt": "Price for a small Jasmine Green Tea?",
            "checks": [
                lambda r: _text_has_any(r, ["jasmine", "small"]),
                lambda r: _price_in_text(r, 4.25),
            ],
        },
        {
            "name": "price_oolong_medium",
            "prompt": "Price for a medium Oolong Milk Tea?",
            "checks": [
                lambda r: _text_has_any(r, ["oolong", "medium"]),
                lambda r: _price_in_text(r, 6.30),
            ],
        },
        {
            "name": "price_taro_large",
            "prompt": "How much is a large Taro Milk Tea?",
            "checks": [
                lambda r: _text_has_any(r, ["taro", "large"]),
                lambda r: _price_in_text(r, 7.76),
            ],
        },
        {
            "name": "price_jasmine_no_size",
            "prompt": "How much is Jasmine Green Tea?",
            "checks": [
                lambda r: _text_has_any(r, ["jasmine", "green", "tea"]),
                lambda r: _price_in_text(r, 4.25),
            ],
        },
        {
            "name": "order_two_taro_medium_two_jasmine_large",
            "prompt": "Two medium Taro Milk Tea and two large Jasmine Green Tea.",
            "checks": [
                lambda r: _text_has_any(r, ["taro", "jasmine"]),
                lambda r: _price_in_text(r, 24.64),
            ],
        },
        {
            "name": "order_passionfruit_small_and_oolong_medium",
            "prompt": "One small Passionfruit Green Tea and one medium Oolong Milk Tea.",
            "checks": [
                lambda r: _text_has_any(r, ["passionfruit", "oolong"]),
                lambda r: _price_in_text(r, 11.30),
            ],
        },
        {
            "name": "order_brown_medium_quantity_three",
            "prompt": "Three medium Brown Sugar Milk Tea, 50% sugar, regular ice.",
            "checks": [
                lambda r: _text_has_all(r, ["brown sugar", "medium", "50%", "regular"]),
                lambda r: _price_in_text(r, 19.80),
            ],
        },
        {
            "name": "order_taro_medium_quantity_two",
            "prompt": "Two medium Taro Milk Tea, 25% sugar, less ice.",
            "checks": [
                lambda r: _text_has_all(r, ["taro", "medium", "25%", "less ice"]),
                lambda r: _price_in_text(r, 13.58),
            ],
        },
        {
            "name": "order_mixed_four_items",
            "prompt": "One large Brown Sugar Milk Tea, one medium Oolong Milk Tea, one small Jasmine Green Tea, one medium Passionfruit Green Tea.",
            "checks": [
                lambda r: _text_has_any(r, ["brown sugar", "oolong", "jasmine", "passionfruit"]),
                lambda r: _price_in_text(r, 24.25),
            ],
        },
        {
            "name": "order_brown_two_small",
            "prompt": "Two small Brown Sugar Milk Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["brown sugar", "small"]),
                lambda r: _price_in_text(r, 11.00),
            ],
        },
        {
            "name": "order_brown_one_large_75_sugar",
            "prompt": "One large Brown Sugar Milk Tea, 75% sugar.",
            "checks": [
                lambda r: _text_has_all(r, ["brown sugar", "large"]),
                lambda r: _price_in_text(r, 7.70),
            ],
        },
        {
            "name": "order_brown_one_medium_less_ice",
            "prompt": "One medium Brown Sugar Milk Tea, less ice.",
            "checks": [
                lambda r: _text_has_all(r, ["brown sugar", "medium"]),
                lambda r: _price_in_text(r, 6.60),
            ],
        },
        {
            "name": "order_jasmine_two_medium",
            "prompt": "Two medium Jasmine Green Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["jasmine", "medium"]),
                lambda r: _price_in_text(r, 9.78),
            ],
        },
        {
            "name": "order_jasmine_two_large",
            "prompt": "Two large Jasmine Green Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["jasmine", "large"]),
                lambda r: _price_in_text(r, 11.06),
            ],
        },
        {
            "name": "order_jasmine_four_small",
            "prompt": "Four small Jasmine Green Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["jasmine", "small"]),
                lambda r: _price_in_text(r, 17.00),
            ],
        },
        {
            "name": "order_oolong_two_small",
            "prompt": "Two small Oolong Milk Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["oolong", "small"]),
                lambda r: _price_in_text(r, 10.50),
            ],
        },
        {
            "name": "order_oolong_one_large",
            "prompt": "One large Oolong Milk Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["oolong", "large"]),
                lambda r: _price_in_text(r, 7.09),
            ],
        },
        {
            "name": "order_oolong_one_medium",
            "prompt": "One medium Oolong Milk Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["oolong", "medium"]),
                lambda r: _price_in_text(r, 6.30),
            ],
        },
        {
            "name": "order_taro_two_small",
            "prompt": "Two small Taro Milk Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["taro", "small"]),
                lambda r: _price_in_text(r, 11.50),
            ],
        },
        {
            "name": "order_taro_three_large",
            "prompt": "Three large Taro Milk Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["taro", "large"]),
                lambda r: _price_in_text(r, 23.28),
            ],
        },
        {
            "name": "order_taro_one_medium",
            "prompt": "One medium Taro Milk Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["taro", "medium"]),
                lambda r: _price_in_text(r, 6.79),
            ],
        },
        {
            "name": "order_passionfruit_two_medium",
            "prompt": "Two medium Passionfruit Green Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["passionfruit", "medium"]),
                lambda r: _price_in_text(r, 12.00),
            ],
        },
        {
            "name": "order_passionfruit_two_small",
            "prompt": "Two small Passionfruit Green Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["passionfruit", "small"]),
                lambda r: _price_in_text(r, 10.00),
            ],
        },
        {
            "name": "order_passionfruit_three_large",
            "prompt": "Three large Passionfruit Green Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["passionfruit", "large"]),
                lambda r: _price_in_text(r, 21.00),
            ],
        },
        {
            "name": "order_passionfruit_one_large",
            "prompt": "One large Passionfruit Green Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["passionfruit", "large"]),
                lambda r: _price_in_text(r, 7.00),
            ],
        },
        {
            "name": "order_passionfruit_one_small",
            "prompt": "One small Passionfruit Green Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["passionfruit", "small"]),
                lambda r: _price_in_text(r, 5.00),
            ],
        },
        {
            "name": "order_brown_four_large",
            "prompt": "Four large Brown Sugar Milk Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["brown sugar", "large"]),
                lambda r: _price_in_text(r, 30.80),
            ],
        },
        {
            "name": "order_brown_five_small",
            "prompt": "Five small Brown Sugar Milk Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["brown sugar", "small"]),
                lambda r: _price_in_text(r, 27.50),
            ],
        },
        {
            "name": "order_oolong_four_medium",
            "prompt": "Four medium Oolong Milk Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["oolong", "medium"]),
                lambda r: _price_in_text(r, 25.20),
            ],
        },
        {
            "name": "order_taro_four_medium",
            "prompt": "Four medium Taro Milk Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["taro", "medium"]),
                lambda r: _price_in_text(r, 27.16),
            ],
        },
        {
            "name": "order_jasmine_five_medium",
            "prompt": "Five medium Jasmine Green Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["jasmine", "medium"]),
                lambda r: _price_in_text(r, 24.45),
            ],
        },
        {
            "name": "order_jasmine_six_large",
            "prompt": "Six large Jasmine Green Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["jasmine", "large"]),
                lambda r: _price_in_text(r, 33.18),
            ],
        },
        {
            "name": "order_passionfruit_five_medium",
            "prompt": "Five medium Passionfruit Green Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["passionfruit", "medium"]),
                lambda r: _price_in_text(r, 30.00),
            ],
        },
        {
            "name": "order_passionfruit_four_small",
            "prompt": "Four small Passionfruit Green Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["passionfruit", "small"]),
                lambda r: _price_in_text(r, 20.00),
            ],
        },
        {
            "name": "order_oolong_two_large",
            "prompt": "Two large Oolong Milk Tea.",
            "checks": [
                lambda r: _text_has_all(r, ["oolong", "large"]),
                lambda r: _price_in_text(r, 14.18),
            ],
        },
    ]
    removed = {
        "unknown_item",
        "price_brown_invalid_size_xl",
        "order_invalid_item_tiger",
        "recommendation",
        "recommendation_topseller",
        "recommendation_low_sugar",
        "ask_menu_milk_tea",
        "ask_menu_fruit_tea",
        "order_mix_brown_medium_jasmine_small",
        "order_mix_taro_large_oolong_small",
        "order_mix_brown_large_jasmine_medium_passionfruit_small",
        "order_combo_three_sizes",
        "order_two_taro_medium_two_jasmine_large",
        "order_passionfruit_small_and_oolong_medium",
        "order_mixed_four_items",
        "order_brown_letter_L",
        "order_jasmine_letter_M",
        "order_taro_letter_S",
        "order_oolong_letter_L",
        "order_passionfruit_letter_M",
        "price_brown_no_size",
        "price_jasmine_no_size",
        "order_oolong_zero_sugar_no_ice_medium",
        "order_brown_75_sugar_extra_ice_medium",
        "order_passionfruit_25_sugar_extra_ice_medium",
        "order_brown_small_no_ice",
    }
    return [c for c in cases if c["name"] not in removed]


def run_cases(agent_fn: Callable[[str], str], cases: List[Case]) -> Tuple[List[dict], int]:
    results = []
    passed = 0

    for case in cases:
        name = case["name"]
        prompt = case["prompt"]
        checks = case["checks"]

        reply = agent_fn(prompt)
        ok = True
        failed_checks: List[int] = []
        for idx, check in enumerate(checks):
            try:
                if not check(reply):
                    ok = False
                    failed_checks.append(idx)
            except Exception:
                ok = False
                failed_checks.append(idx)

        if ok:
            passed += 1
        results.append(
            {
                "name": name,
                "ok": ok,
                "failed_checks": failed_checks,
                "reply": reply,
            }
        )
        status = "OK" if ok else "FAIL"
        print(f"[{status}] {name}: {reply}")

    return results, passed


def main():
    if not os.getenv("OPENAI_API_KEY"):
        raise SystemExit("Set OPENAI_API_KEY before running the benchmark.")

    agent_reply = _load_agent_reply()
    cases = define_cases()
    results, passed = run_cases(agent_reply, cases)
    total = len(cases)
    print(f"\nPassed {passed}/{total} cases.")

    out_path = Path(__file__).resolve().parent / "bench_results.json"
    with open(out_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"Saved detailed results to {out_path}")


if __name__ == "__main__":
    main()
