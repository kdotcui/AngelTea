
# Set your API key in the environment before running, e.g.:
# export OPENAI_API_KEY="sk-..."

from openai import OpenAI
import os
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
r = client.responses.create(model="gpt-4.1-mini", input="say ok")
print(r.output_text)
