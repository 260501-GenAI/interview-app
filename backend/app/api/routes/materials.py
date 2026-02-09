"""Materials upload and management routes."""
import uuid
from fastapi import APIRouter, UploadFile, File, HTTPException, status

from app.api.deps import VectorStoreDep, SettingsDep
from app.models.schemas import MaterialUploadResponse, ErrorResponse


router = APIRouter(prefix="/materials", tags=["materials"])


@router.post(
    "/upload",
    response_model=MaterialUploadResponse,
    responses={
        400: {"model": ErrorResponse, "description": "Invalid file type"},
        500: {"model": ErrorResponse, "description": "Processing error"},
    },
    summary="Upload study materials",
    description="Upload PDF or text files to be indexed for interview question generation."
)
async def upload_material(
    file: UploadFile = File(..., description="PDF or TXT file to upload"),
    vectorstore: VectorStoreDep = None,
    settings: SettingsDep = None,
) -> MaterialUploadResponse:
    """
    Upload study materials for RAG-based question generation.
    
    Supported formats:
    - PDF (.pdf)
    - Text (.txt)
    - Markdown (.md)
    """
    # Validate file type
    allowed_extensions = {".pdf", ".txt", ".md"}
    file_ext = "." + file.filename.split(".")[-1].lower() if "." in file.filename else ""
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type. Allowed: {', '.join(allowed_extensions)}"
        )
    
    try:
        # Read file content
        content = await file.read()
        
        # Process based on file type
        if file_ext == ".pdf":
            text_content = await vectorstore.process_pdf(content)
        else:
            text_content = content.decode("utf-8")
        
        # Generate material ID
        material_id = str(uuid.uuid4())
        
        # Index in vector store
        chunks_created = await vectorstore.index_document(
            document_id=material_id,
            content=text_content,
            metadata={"filename": file.filename, "type": file_ext}
        )
        
        return MaterialUploadResponse(
            material_id=material_id,
            filename=file.filename,
            chunks_created=chunks_created,
            message=f"Successfully indexed {chunks_created} chunks from {file.filename}"
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing file: {str(e)}"
        )


@router.get(
    "/list",
    summary="List uploaded materials",
    description="Get a list of all uploaded study materials."
)
async def list_materials(
    vectorstore: VectorStoreDep = None,
) -> dict:
    """List all indexed materials."""
    materials = await vectorstore.list_documents()
    return {"materials": materials, "count": len(materials)}


@router.delete(
    "/{material_id}",
    summary="Delete a material",
    description="Remove a study material from the index."
)
async def delete_material(
    material_id: str,
    vectorstore: VectorStoreDep = None,
) -> dict:
    """Delete a material by ID."""
    await vectorstore.delete_document(material_id)
    return {"message": f"Material {material_id} deleted successfully"}
