import os
import requests
from textwrap import dedent
from fastapi import HTTPException
from logging import getLogger
from dotenv import load_dotenv

load_dotenv()
logger = getLogger(__name__)

class ElevenLabsClient:
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.base_url = "https://api.elevenlabs.io/v1"
        self.headers = {
            "Xi-Api-Key": api_key,
        }

    def create_agent(self, name: str, first_prompt: str, language_code: str, roleplay_name: str, roleplay_scenario: str, voice_id: str) -> str:
        response = requests.post(
            f"{self.base_url}/convai/agents/create",
            headers=self.headers,
            json={
                "name": name,
                "tags": ["roleplay", "base"],
                "conversation_config": {
                    "agent": {
                        "first_message": first_prompt,
                        "language": language_code.lower(),
                        "prompt": {
                            "prompt": dedent(f"""
You are a roleplay agent for a language learning roleplay.
The roleplay is about {roleplay_name}.
The scenario is:
{roleplay_scenario}
                            """),
                            "llm": "gemini-2.5-flash",
                            "temperature": 0.3,
                        },
                    },
                    "tts": {
                        "model_id": "eleven_flash_v2_5",
                        "voice_id": voice_id,
                    },
                    "conversation": {
                        "client_events": ["audio", "interruption", "user_transcript", "agent_response"],
                    }
                },
            }
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Failed to create roleplay agent: {response.json()}")
        
        return response.json()["agent_id"]

    def get_agent(self, agent_id: str) -> dict:
        response = requests.get(
            f"{self.base_url}/convai/agents/{agent_id}",
            headers=self.headers,
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Failed to get roleplay agent: {response.json()}")
        return response.json()

    def create_agent_run(self, agent_data: dict, speed: float) -> str:
        agent_data["name"] = f"{agent_data['name']} (Run)"
        agent_data["tags"] = ["roleplay", "run"]
        agent_data["conversation_config"]["agent"]["speed"] = speed

        response = requests.post(
            f"{self.base_url}/convai/agents/create",
            headers=self.headers,
            json=agent_data,
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Failed to create roleplay agent run: {response.json()}")
        
        return response.json()["agent_id"]

    def delete_agent(self, agent_id: str) -> None:
        response = requests.delete(
            f"{self.base_url}/convai/agents/{agent_id}",
            headers=self.headers,
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Failed to delete roleplay agent: {response.json()}")

    def list_conversations(self, agent_id: str) -> dict:
        has_more = True
        next_cursor = None
        all_conversations = []
        
        while has_more:
            response = requests.get(
                f"{self.base_url}/convai/conversations",
                headers=self.headers,
                params={
                    "agent_id": agent_id,
                    "page_size": 100,
                    "cursor": next_cursor or "",
                }
            )
            if response.status_code != 200:
                raise HTTPException(status_code=500, detail=f"Failed to get conversations: {response.json()}")
            
            data = response.json()
            all_conversations.extend(data.get("conversations", []))
            has_more = data.get("has_more", False)
            if has_more:
                next_cursor = data.get("next_cursor")
        
        return all_conversations

    def get_conversation(self, conversation_id: str) -> dict:
        response = requests.get(
            f"{self.base_url}/convai/conversations/{conversation_id}",
            headers=self.headers,
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Failed to get conversation: {response.json()}")
        return response.json()
    
    def get_conversation_audio(self, conversation_id: str) -> str:
        response = requests.get(
            f"{self.base_url}/convai/conversations/{conversation_id}/audio",
            headers=self.headers,
        )
        if response.status_code != 200:
            raise HTTPException(status_code=500, detail=f"Failed to get conversation audio: {response.json()}")
        return response.content

# Create a singleton instance
client = ElevenLabsClient(api_key=os.getenv("ELEVENLABS_API_KEY")) 