from io import BytesIO
from textwrap import dedent
from typing import Union
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from google import genai
from google.genai import types
from supabase import create_client, Client
from PIL import Image
import os
import re
from uuid import uuid4
from dotenv import load_dotenv
from logging import getLogger, basicConfig, INFO

# Configure logging
basicConfig(
    level=INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = getLogger(__name__)

load_dotenv()

GEMINI_MODEL = "gemini-2.5-flash-preview-04-17"
GEMINI_IMAGE_MODEL = "gemini-2.0-flash-preview-image-generation"

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods including OPTIONS
    allow_headers=["*"],  # Allows all headers
)

client = genai.Client(api_key=os.getenv("GOOGLE_API_KEY"))
supabase: Client = create_client(os.getenv("SUPABASE_URL"), os.getenv("SUPABASE_KEY"))

class RoleplayDescriptionRequest(BaseModel):
    roleplay_name: str
    language: str

@app.post("/api/v1/roleplay/description")
def get_roleplay_description(request: RoleplayDescriptionRequest):
    response = client.models.generate_content(
        model=GEMINI_MODEL, 
        contents=dedent(f"""
            You are about to do a 1-on-1 roleplay conversation with a student who is trying to learn the language of {request.language}.
            The title of the roleplay is {request.roleplay_name}.
            Generate a detailed description of the scenario for the roleplay.
            Include ideas about the setting, storyline, topics covered, and other details that would be helpful for the roleplay.
            This will form a key part of the input to the AI voice agent that will actually perform the roleplay.
            Return the description only. Do not include any other text. Do not use markdown. Use plain text. Do not exceed 100 words.
        """)
    )
    return {
        "description": response.text
    }

class RoleplayImageRequest(BaseModel):
    teacher_id: str
    roleplay_name: str
    roleplay_scenario: str
    language: str

@app.post("/api/v1/roleplay/image")
def get_roleplay_image(request: RoleplayImageRequest):
    response = client.models.generate_content(
        model=GEMINI_IMAGE_MODEL,
        contents=dedent(f"""
You are about to do a 1-on-1 roleplay conversation with a student who is trying to learn the language of {request.language}.
The title of the roleplay is {request.roleplay_name}.
The description of the scenario is:
{request.roleplay_scenario}

1. Generate the first line of speech the AI roleplay character would say to kick the roleplay off. Write in {request.language}.
This must be a single question. Do not include any other text. Do not use markdown. Keep it short. It must be written in {request.language}.
Surround it with <question> and </question> tags.

2. Generate an image of the roleplay scenario. This will serve as the background for the roleplay.
        """),
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"],
        )
    )

    first_prompt = None
    image_id = None
    for part in response.candidates[0].content.parts:
        if part.text is not None:
            # Extract text between <question> tags
            match = re.search(r"<question>(.*?)</question>", part.text)
            if match:
                first_prompt = match.group(1)
            else:
                first_prompt = part.text
        elif part.inline_data is not None:
            image = Image.open(BytesIO((part.inline_data.data)))
            image_id = str(uuid4())
    
    if first_prompt is None or image_id is None:
        raise HTTPException(status_code=500, detail="Failed to generate roleplay image")
    
    # Convert PIL Image to bytes
    img_byte_arr = BytesIO()
    image.save(img_byte_arr, format='PNG')
    img_byte_arr = img_byte_arr.getvalue()
    
    response = supabase.storage.from_("roleplay").upload(f"{request.teacher_id}/previews/{image_id}.png", img_byte_arr)
    logger.info(f"Uploaded image to {response.path}")

    return {
        "first_prompt": first_prompt,
        "image_path": response.path,
    }

@app.delete("/api/v1/roleplay/deletePreviews")
def delete_roleplay_previews(teacher_id: str):
    try:
        # List all files in the previews folder for the teacher
        previews = supabase.storage.from_("roleplay").list(f"{teacher_id}/previews")
        
        # Delete each preview file
        for preview in previews:
            supabase.storage.from_("roleplay").remove([f"{teacher_id}/previews/{preview['name']}"])
        
        return {"message": "All previews deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to delete previews: {str(e)}")
