import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))


class UserMessage:
    def __init__(self, text: str):
        self.text = text


class LlmChat:
    def __init__(self, system_message="You are ElastoAI, an expert assistant for elastomers and rubber compounding. Be accurate with abbreviations: NR = Natural Rubber, NBR = Nitrile Butadiene Rubber. Answer briefly unless asked for detail."):
        self.system_message = system_message
        self.model = "llama-3.1-8b-instant"   # good speed choice on Groq

    async def send_message(self, message: UserMessage, history=None):
        try:
            messages = [
                {"role": "system", "content": self.system_message}
            ]

            if history:
                messages.extend(history[-4:])

            messages.append({"role": "user", "content": message.text})

            response = client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.2,
                max_tokens=1000
            )

            return response.choices[0].message.content

        except Exception as e:
         print("LLM ERROR:", e)
        return "I couldn't generate a response right now."