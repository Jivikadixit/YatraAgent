import hashlib
import uuid
import base64
from typing import Dict, Any

class CloudKMSService:
    """
    Google Cloud KMS Tokenization & Encrypted Payment Delegation Rail
    Secures Passenger PII (Aadhaar / Passport) and delegates ephemeral UPI AutoPay / Virtual Cards.
    """
    def __init__(self, key_ring: str = "yatra-security", key_name: str = "passenger-pii-token-key"):
        self.key_resource_id = f"projects/yatra-agent-prod/locations/asia-south1/keyRings/{key_ring}/cryptoKeys/{key_name}"

    def tokenize_passenger_id(self, id_type: str, raw_id_value: str, passenger_name: str) -> Dict[str, Any]:
        """
        Simulates envelope encryption using Cloud KMS key.
        Produces an irreversible token hash for booking engines while safeguarding raw PII.
        """
        salt = "GCP_KMS_AES256_GCM_SALT"
        token_hash = hashlib.sha256(f"{salt}_{raw_id_value}_{passenger_name}".encode()).hexdigest()
        masked_id = f"XXXX-XXXX-{raw_id_value[-4:]}" if len(raw_id_value) >= 4 else "XXXX-0000"
        
        token_id = f"kms_tok_{uuid.uuid4().hex[:12]}"
        
        return {
            "token_id": token_id,
            "id_type": id_type, # 'Aadhaar' or 'Passport'
            "masked_identifier": masked_id,
            "kms_key_version": f"{self.key_resource_id}/cryptoKeyVersions/1",
            "token_hash": token_hash,
            "status": "SECURE_TOKENIZED",
            "verification_status": "GOVT_DIGILOCKER_VERIFIED"
        }

    def generate_delegated_payment_token(self, user_id: str, max_spend_limit_inr: int, payment_rail: str = "UPI_AUTOPAY") -> Dict[str, Any]:
        """
        Issues a single-use sandboxed payment authorization token bound to the Saga workflow.
        """
        mandate_id = f"MND_{uuid.uuid4().hex[:8].upper()}"
        payment_token = f"KMS_PAY_{uuid.uuid4().hex[:16]}"
        
        return {
            "payment_token": payment_token,
            "mandate_id": mandate_id,
            "payment_rail": payment_rail, # 'UPI_AUTOPAY' or 'VIRTUAL_CREDIT_CARD'
            "max_spend_limit_inr": max_spend_limit_inr,
            "encryption_algorithm": "GOOGLE_CLOUD_KMS_AES_256_GCM",
            "hitl_consent_required": True,
            "status": "DELEGATED_SANDBOX_READY"
        }

    def settle_tokenized_payment(self, payment_token: str, amount_inr: int, merchant_ref: str) -> Dict[str, Any]:
        """Executes settlement on the delegated payment token"""
        txn_id = f"TXN_UPI_{uuid.uuid4().hex[:10].upper()}"
        return {
            "status": "SETTLED",
            "transaction_id": txn_id,
            "amount_inr": amount_inr,
            "merchant_ref": merchant_ref,
            "payment_token_used": payment_token[:8] + "...",
            "settlement_rail": "NPCI_UPI_2.0_AUTOPAY_DEBIT"
        }

kms_service = CloudKMSService()
