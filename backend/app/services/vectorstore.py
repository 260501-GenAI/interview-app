"""ChromaDB Vector Store Service for RAG."""
import io
from typing import Optional
import chromadb
from chromadb.config import Settings as ChromaSettings


class VectorStoreService:
    """Service for managing document embeddings with ChromaDB."""
    
    def __init__(self, persist_dir: str = "./chroma_db"):
        """Initialize ChromaDB client with persistence."""
        self.client = chromadb.PersistentClient(
            path=persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        self.collection = self.client.get_or_create_collection(
            name="interview_materials",
            metadata={"description": "Study materials for interview preparation"}
        )
        self._document_registry: dict[str, dict] = {}
    
    async def process_pdf(self, content: bytes) -> str:
        """Extract text from PDF bytes."""
        try:
            from pypdf import PdfReader
            pdf_reader = PdfReader(io.BytesIO(content))
            text_parts = []
            for page in pdf_reader.pages:
                text_parts.append(page.extract_text() or "")
            return "\n\n".join(text_parts)
        except ImportError:
            raise ValueError("pypdf not installed. Run: pip install pypdf")
        except Exception as e:
            raise ValueError(f"Error processing PDF: {str(e)}")
    
    async def index_document(
        self,
        document_id: str,
        content: str,
        metadata: Optional[dict] = None,
        chunk_size: int = 1000,
        chunk_overlap: int = 200,
    ) -> int:
        """
        Index document content into vector store.
        
        Args:
            document_id: Unique identifier for the document
            content: Text content to index
            metadata: Optional metadata for the document
            chunk_size: Size of text chunks
            chunk_overlap: Overlap between chunks
            
        Returns:
            Number of chunks created
        """
        # Simple chunking (in production use LangChain text splitters)
        chunks = self._chunk_text(content, chunk_size, chunk_overlap)
        
        if not chunks:
            return 0
        
        # Generate IDs for each chunk
        chunk_ids = [f"{document_id}_{i}" for i in range(len(chunks))]
        
        # Prepare metadata for each chunk
        chunk_metadata = [
            {
                **(metadata or {}),
                "document_id": document_id,
                "chunk_index": i,
            }
            for i in range(len(chunks))
        ]
        
        # Add to collection
        self.collection.add(
            ids=chunk_ids,
            documents=chunks,
            metadatas=chunk_metadata,
        )
        
        # Register document
        self._document_registry[document_id] = {
            "id": document_id,
            "chunk_count": len(chunks),
            **(metadata or {})
        }
        
        return len(chunks)
    
    def _chunk_text(
        self,
        text: str,
        chunk_size: int,
        chunk_overlap: int
    ) -> list[str]:
        """Split text into overlapping chunks."""
        if not text:
            return []
        
        chunks = []
        start = 0
        
        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]
            
            # Try to break at sentence boundary
            if end < len(text):
                last_period = chunk.rfind(". ")
                if last_period > chunk_size // 2:
                    chunk = chunk[:last_period + 1]
                    end = start + last_period + 1
            
            chunks.append(chunk.strip())
            start = end - chunk_overlap
        
        return chunks
    
    async def query(
        self,
        query: str,
        n_results: int = 5,
        document_id: Optional[str] = None,
    ) -> str:
        """
        Query the vector store for relevant content.
        
        Args:
            query: Search query
            n_results: Number of results to return
            document_id: Optional filter by document
            
        Returns:
            Concatenated relevant content
        """
        where_filter = None
        if document_id:
            where_filter = {"document_id": document_id}
        
        results = self.collection.query(
            query_texts=[query],
            n_results=n_results,
            where=where_filter,
        )
        
        if not results["documents"] or not results["documents"][0]:
            return ""
        
        return "\n\n---\n\n".join(results["documents"][0])
    
    async def list_documents(self) -> list[dict]:
        """List all indexed documents."""
        return list(self._document_registry.values())
    
    async def delete_document(self, document_id: str) -> None:
        """Delete a document and all its chunks."""
        # Get all chunk IDs for this document
        results = self.collection.get(
            where={"document_id": document_id}
        )
        
        if results["ids"]:
            self.collection.delete(ids=results["ids"])
        
        if document_id in self._document_registry:
            del self._document_registry[document_id]
