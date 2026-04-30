import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_answer(question: str, chunks: list[dict]) -> str:
    """
    Given a question and retrieved chunks, ask GPT to answer
    using only the provided context. This prevents hallucination.
    """
    context = "\n\n".join([
        f"[Chunk {i+1}]:\n{chunk['content']}"
        for i, chunk in enumerate(chunks)
    ])

    prompt = f"""You are a helpful assistant that answers questions strictly based on the provided document context.
If the answer is not found in the context, say "I couldn't find that information in the uploaded document."
Never make up information.

Context:
{context}

Question: {question}

Answer:"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0
    )

    return response.choices[0].message.content