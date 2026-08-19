import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_ID: str = os.getenv("GOOGLE_CLOUD_PROJECT", "yatra-agent-prod")
    REGION: str = os.getenv("GOOGLE_CLOUD_REGION", "asia-south1")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    KMS_KEY_RING: str = os.getenv("KMS_KEY_RING", "projects/yatra-agent/locations/asia-south1/keyRings/yatra-security")
    KMS_CRYPTO_KEY: str = os.getenv("KMS_CRYPTO_KEY", "passenger-pii-token-key")
    FIRESTORE_SESSION_COLLECTION: str = "sessions_30d"
    ALLOYDB_VECTOR_TABLE: str = "taste_vector_embeddings"
    HOLD_TTL_MINUTES: int = 10

settings = Settings()
