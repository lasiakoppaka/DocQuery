import os
from pinecone import Pinecone
from dotenv import load_dotenv
from embeddings import get_embedding
from sqlalchemy.orm import Session
from models import Chunk

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
index = pc.Index(os.getenv("PINECONE_INDEX"))

def upsert_chunk(chunk_id: int, content: str, document_id: int):
    """
    Embed a chunk and store it in Pinecone.
    """
    embedding = get_embedding(content)
    index.upsert(vectors=[{
        "id": str(chunk_id),
        "values": embedding,
        "metadata": {
            "document_id": document_id,
            "content": content
        }
    }])

def retrieve_chunks(question: str, top_k: int = 3) -> list[dict]:
    """
    Embed the question and find the top_k most similar chunks in Pinecone.
    """
    question_embedding = get_embedding(question)

    results = index.query(
        vector=question_embedding,
        top_k=top_k,
        include_metadata=True
    )

    chunks = []
    for match in results.matches:
        chunks.append({
            "id": match.id,
            "content": match.metadata["content"],
            "document_id": match.metadata["document_id"],
            "similarity": round(match.score, 4)
        })

    return chunks