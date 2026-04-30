import { useState } from "react";

export default function App() {
  const [file, setFile] = useState(null);
  const [documentId, setDocumentId] = useState(null);
  const [filename, setFilename] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [sources, setSources] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");

  const uploadFile = async () => {
    if (!file) return;
    setUploading(true);
    setError("");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setDocumentId(data.document_id);
      setFilename(data.filename);
    } catch (err) {
      setError("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const askQuestion = async () => {
    if (!question || !documentId) return;
    setAsking(true);
    setError("");
    setAnswer(null);
    setSources([]);

    try {
      const res = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, document_id: documentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail);
      setAnswer(data.answer);
      setSources(data.sources);
    } catch (err) {
      setError("Error: " + err.message);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 720,
        margin: "60px auto",
        fontFamily: "sans-serif",
        padding: "0 20px",
      }}
    >
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 4 }}>
        DocQuery
      </h1>
      <p style={{ color: "#666", marginBottom: 40 }}>
        Upload a document and ask questions about it
      </p>

      {/* Upload Section */}
      <div
        style={{
          background: "#f9f9f9",
          border: "1px solid #e0e0e0",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>1. Upload a Document</h2>
        <input
          type="file"
          accept=".pdf,.txt"
          onChange={(e) => setFile(e.target.files[0])}
          style={{ marginBottom: 12, display: "block" }}
        />
        <button
          onClick={uploadFile}
          disabled={!file || uploading}
          style={{
            background: uploading ? "#ccc" : "#1a1a1a",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            cursor: uploading ? "not-allowed" : "pointer",
            fontSize: 14,
          }}
        >
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {documentId && (
          <p style={{ marginTop: 12, color: "#2e7d32", fontWeight: 500 }}>
            ✓ {filename} uploaded successfully
          </p>
        )}
      </div>

      {/* Question Section */}
      <div
        style={{
          background: "#f9f9f9",
          border: "1px solid #e0e0e0",
          borderRadius: 12,
          padding: 24,
          marginBottom: 24,
        }}
      >
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>2. Ask a Question</h2>
        <input
          type="text"
          placeholder="What is this document about?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && askQuestion()}
          disabled={!documentId}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 14,
            marginBottom: 12,
            boxSizing: "border-box",
          }}
        />
        <button
          onClick={askQuestion}
          disabled={!question || !documentId || asking}
          style={{
            background: asking || !documentId ? "#ccc" : "#1a1a1a",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            cursor: asking || !documentId ? "not-allowed" : "pointer",
            fontSize: 14,
          }}
        >
          {asking ? "Thinking..." : "Ask"}
        </button>
      </div>

      {/* Error */}
      {error && <p style={{ color: "#c62828", marginBottom: 16 }}>{error}</p>}

      {/* Answer */}
      {answer && (
        <div
          style={{
            background: "#f0f7ff",
            border: "1px solid #bbdefb",
            borderRadius: 12,
            padding: 24,
            marginBottom: 24,
          }}
        >
          <h2 style={{ fontSize: 18, marginBottom: 12 }}>Answer</h2>
          <p style={{ lineHeight: 1.7, margin: 0 }}>{answer}</p>
        </div>
      )}

      {/* Sources */}
      {sources.length > 0 && (
        <div
          style={{ borderRadius: 12, border: "1px solid #e0e0e0", padding: 24 }}
        >
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Sources</h2>
          {sources.map((source, i) => (
            <div
              key={i}
              style={{
                marginBottom: 16,
                paddingBottom: 16,
                borderBottom:
                  i < sources.length - 1 ? "1px solid #eee" : "none",
              }}
            >
              <p style={{ fontSize: 12, color: "#888", marginBottom: 6 }}>
                Chunk {source.id} · Similarity: {source.similarity}
              </p>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.6,
                  margin: 0,
                  color: "#444",
                }}
              >
                {source.content.slice(0, 300)}...
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
