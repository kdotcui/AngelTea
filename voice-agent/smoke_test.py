
#export OPENAI_API_KEY="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"

from openai import OpenAI
import os
client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
r = client.responses.create(model="gpt-4.1-mini", input="say ok")
print(r.output_text)
