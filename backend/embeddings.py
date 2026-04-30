import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def get_embedding(text: str) -> list[float]:
    """
    Convert a string of text into a vector embedding using OpenAI.
    Returns a list of 1024 floats.
    """
    response = client.embeddings.create(
        input=text,
        model="text-embedding-3-small",
        dimensions=1024
    )
    return response.data[0].embedding