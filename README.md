# DocQuery

A full-stack RAG (Retrieval-Augmented Generation) system that lets users upload PDF documents and ask questions, receiving AI-generated answers grounded strictly in the uploaded content — eliminating hallucination by design.

## Demo
Upload a PDF → Ask a question → Get a cited, grounded answer in seconds.

## How It Works

1. **Ingest** — User uploads a PDF which gets parsed and chunked into 500-word segments
2. **Embed** — Each chunk is embedded using OpenAI's `text-embedding-3-small` model and stored in Pinecone
3. **Retrieve** — At query time, the user's question is embedded and Pinecone returns the top-3 most semantically similar chunks via cosine similarity search
4. **Generate** — Retrieved chunks are injected as grounded context into a GPT-4o-mini prompt, constrained to only answer from the provided document content
5. **Display** — Answer is returned with inline source citations in the React UI

## Tech Stack

**Backend:** Python, FastAPI, PostgreSQL, SQLAlchemy  
**AI & ML:** OpenAI API (embeddings + GPT-4o-mini), Pinecone, RAG, LangChain  
**Frontend:** React, Vite  
**DevOps:** Docker, CI/CD  

## Project Structure
