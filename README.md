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
DocQuery/
├── backend/
│   ├── main.py           # FastAPI routes
│   ├── embeddings.py     # OpenAI embedding logic
│   ├── chunker.py        # PDF parsing and chunking
│   ├── retriever.py      # Pinecone similarity search
│   ├── generator.py      # GPT answer generation
│   ├── database.py       # PostgreSQL setup
│   ├── models.py         # SQLAlchemy models
│   └── requirements.txt
├── frontend/
│   └── src/
│       └── App.jsx
└── README.md

## Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL
- OpenAI API key
- Pinecone API key

### Backend Setup

```bash
cd backend
pip install -r requirements.txt
```

Create a `.env` file:
Run the server:

```bash
uvicorn main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Key Features

- **Zero hallucination** — model is constrained to answer only from uploaded document content
- **Semantic search** — cosine similarity retrieval surfaces the most relevant chunks per query
- **Inline citations** — every answer includes references to the source chunks it drew from
- **Persistent storage** — full document and query history stored in PostgreSQL
- **Fast retrieval** — Pinecone vector search returns top-3 chunks in milliseconds

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/upload` | Upload and ingest a PDF |
| POST | `/query` | Ask a question against uploaded documents |
| GET | `/documents` | List all uploaded documents |


