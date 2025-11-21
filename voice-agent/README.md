# Voice Ordering Agent for Angel Tea

This folder contains a **Python-based voice ordering demo** for Angel Tea.  
It lets a user speak into the microphone, transcribes the audio, uses an AI agent with tools to understand the request (recommendations / prices / orders), and then speaks the reply back.

The main entry script is:

- `voice_ordering_demo.py` (or the file you see here with the same logic)

Only this script is needed to run the demo; other files in this folder are earlier dev experiments and can be ignored.

---

## What this demo can do

- **Full Angel Tea menu built in**
  - Explicit **M/L pricing** for drinks
  - Categories like milk tea, fresh tea, fruit tea, special drinks, slush, yakult, etc.
  - Marked **topsellers** and bundled toppings where needed
- **Toppings support**
  - Dedicated topping list (boba, coconut jelly, popping bubbles, milk foam, etc.)
  - Extra toppings are charged at **+$0.80** each
- **Structured orders**
  - Understands: drink name, **size (M/L)**, **sugar level**, **ice level**, **toppings**, **quantity**
  - Calculates item totals and full order total in USD
  - Generates an internal structured order (list of items + total), with a random `order_id`
- **Agent with tools**
  - Tools exposed to the model:
    - `get_menu(query)` – return menu items, optionally filtered
    - `get_price(name, size, toppings)` – get price including toppings
    - `place_order(items)` – validate items and compute total
  - The system prompt forces the agent to:
    - Keep answers short (1–3 sentences)
    - Confirm item / size / sugar / ice / toppings / quantity when placing orders
    - Never invent drinks or prices not in the menu
- **End-to-end voice loop**
  - You press Enter → it records a short clip (auto stop on ~1s of silence)
  - Audio is sent to **OpenAI STT** for transcription
  - Conversation + tools go to **OpenAI chat model**
  - Reply is sent to **OpenAI TTS**, and played back with `afplay` (macOS) or `play` (SoX)

Example things you can say:

- “What do you recommend?”
- “How much is a large Brown Sugar Bubble Tea?”
- “Two medium Angel Milk Tea, 50% sugar, less ice; one large Mango Pomelo Sago Nectar with boba.”

---

## Requirements

### Runtime

- Python **3.10+** (recommended)
- Tested primarily on **macOS**; Linux should also work with SoX installed.
- A working microphone.

### System tools

- [`sox`](http://sox.sourceforge.net/) command line tool for recording:
  - macOS (Homebrew):

    ```bash
    brew install sox
    ```

  - Ubuntu / Debian:

    ```bash
    sudo apt-get update
    sudo apt-get install sox
    ```

  - (Windows is not officially supported in this demo; you may use WSL or install SoX + audio player manually.)

The script uses:

- `sox` to record: saves mono 16kHz WAV to `input.wav`, auto-stops on ~1s silence (max 10s).
- `afplay` on macOS, or `play` (from SoX) on other platforms to play `reply.mp3`.

### Python packages

Install the OpenAI Python SDK (new 1.x API):

```bash
pip install --upgrade openai
```

No other external Python dependencies are required (only stdlib + `openai`).

---

## Setup

1. **Clone / download** this repo and go into the `voice-agent` folder.

2. Make sure `sox` is installed and works from the terminal:

   ```bash
   sox --version
   ```

3. Set your OpenAI API key in an environment variable:

   ```bash
   export OPENAI_API_KEY="sk-..."   # macOS / Linux
   ```

   The script will exit with an error if `OPENAI_API_KEY` is missing.

---

## How to run

From the `voice-agent` folder, run:

```bash
python voice_ordering_demo.py
# or: python <your_uploaded_filename>.py  (if the script name is different)
```

You will see something like:

- “Voice Ordering Demo (Angel Tea)”
- Instructions: press Enter each round, speak, then pause ~1 second.

Each round:

1. Press **Enter** when prompted (`[Round N] Press Enter to record...`).
2. Speak your question or order, then pause.
3. Recording stops automatically on ~1s of silence.
4. The script:
   - Sends `input.wav` to STT (`gpt-4o-mini-transcribe`).
   - Sends the transcribed text + conversation + tools to the chat model.
   - Receives a reply and any tool calls.
   - Executes tool calls (menu / price / order).
   - Sends the final answer to TTS (`gpt-4o-mini-tts`).
5. The answer is printed as text and played back as audio (`reply.mp3`).

Press `Ctrl+C` to exit.

---

## How it works (high level)

- **Config**
  - Reads `OPENAI_API_KEY` and creates an `OpenAI` client.
  - Defines `REC_CMD` with SoX parameters for mono 16kHz WAV + silence detection.

- **Menu & pricing**
  - The full Angel Tea menu is encoded in a `MENU` dictionary with:
    - `category` (e.g., `milk_tea`, `fruit_tea`, `yakult`).
    - `prices` for `m` and `l`.
    - Optional `topseller` and `included_toppings`.
  - Toppings are defined in `TOPPINGS` plus `TOPPING_SYNONYMS` for fuzzy matching.
  - Helper functions:
    - Normalize/clean names.
    - Fuzzy match drink and topping names.
    - Compute line item totals and order total (base price + $0.80 per extra topping).

- **Tools**
  - `tool_get_menu(query)`: returns a trimmed, menu-friendly list; topsellers first.
  - `tool_get_price(name, size, toppings)`: returns `{found, price, suggestion}`.
  - `tool_place_order(items)`: validates items, calculates total, and attaches an `order_id`.

- **Agent loop**
  - Maintains a `conversation` list with a rich system prompt (`SYSTEM_PROMPT`).
  - Uses `tools=TOOLS` and `tool_choice="auto"` so the model can decide when to call tools.
  - Supports multiple tool rounds (up to 3); if tool calls keep looping, it falls back to a simple clarification message.

- **Audio I/O**
  - `record_once()`: runs `REC_CMD` and checks the return code.
  - `transcribe()`: uses `client.audio.transcriptions.create(...)`.
  - `speak(text)`: uses `client.audio.speech.create(...)`, writes `reply.mp3`, and plays it.

---

## Notes & limitations

- This demo is **command-line only** and not yet wired into the Next.js web app.
- Audio files `input.wav` and `reply.mp3` are overwritten each round.
- The menu and prices are hard-coded; if the real-world menu changes, the script must be updated.
- Other `.py` files in this folder (if any) are **dev scratch files** and not required to run the demo.

If you only want to show the working demo for grading or a demo session, it is enough to have:

- This `README.md`
- The main script (`voice_ordering_demo.py` or equivalent)
- `openai` installed and `sox` available on the system
- `OPENAI_API_KEY` set in your environment
