import os
import io
from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
import pdfplumber

from database import get_db, init_db
from models import Document, Chunk
from chunker import chunk_text
from retriever import upsert_chunk, retrieve_chunks
from generator import generate_answer

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def startup():
    init_db()

class QuestionRequest(BaseModel):
    question: str
    document_id: int

@app.get("/health")
def health():
    return {"status": "ok"}

@app.post("/upload")
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    contents = await file.read()

    if file.filename.endswith(".pdf"):
        with pdfplumber.open(io.BytesIO(contents)) as pdf:
            text = "\n".join([
                page.extract_text() for page in pdf.pages
                if page.extract_text()
            ])
    elif file.filename.endswith(".txt"):
        text = contents.decode("utf-8")
    else:
        raise HTTPException(status_code=400, detail="Only PDF and .txt files are supported")

    # Save document to PostgreSQL
    document = Document(filename=file.filename, content=text)
    db.add(document)
    db.commit()
    db.refresh(document)

    # Chunk the text
    chunks = chunk_text(text)

    # Save each chunk to PostgreSQL + embed and upsert to Pinecone
    for i, chunk_content in enumerate(chunks):
        chunk = Chunk(
            document_id=document.id,
            content=chunk_content
        )
        db.add(chunk)
        db.commit()
        db.refresh(chunk)

        # Send embedding to Pinecone
        upsert_chunk(chunk.id, chunk_content, document.id)

    return {
        "message": "Document uploaded and processed successfully",
        "document_id": document.id,
        "filename": file.filename,
        "chunks_created": len(chunks)
    }

@app.post("/ask")
def ask_question(request: QuestionRequest, db: Session = Depends(get_db)):
    chunks = retrieve_chunks(request.question)

    if not chunks:
        raise HTTPException(status_code=404, detail="No relevant chunks found")

    answer = generate_answer(request.question, chunks)

    return {
        "answer": answer,
        "sources": chunks
    }

@app.get("/documents")
def get_documents(db: Session = Depends(get_db)):
    documents = db.query(Document).all()
    return [
        {"id": doc.id, "filename": doc.filename, "created_at": doc.created_at}
        for doc in documents
    ]