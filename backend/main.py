from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from roleplay import router as roleplay_router

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods including OPTIONS
    allow_headers=["*"],  # Allows all headers
)

# Include the roleplay router
app.include_router(roleplay_router)
