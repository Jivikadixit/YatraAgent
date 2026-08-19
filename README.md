# 🪷 YatraAgent: Autonomous & Culturally Aware Travel Platform

> **Zero-Touch, Culturally Aware Autonomous Travel Planning and Multi-Modal Booking Platform on Google Cloud.**

![YatraAgent Dashboard Preview](docs/images/dashboard_preview.jpg)

---

## 🌟 Executive Overview & Mission

**YatraAgent** is a next-generation autonomous travel planning and multi-modal booking platform specifically architected for Indian cultural journeys, pilgrimages, and heritage tourism. It solves the fragmentation of Indian travel planning by unifying:
1. **Gemini 2.5 Cognitive Planner** with RAG-grounded temple attire, rituals, and strict regional dietary filters (*Jain, Sattvic, Pure Veg*).
2. **Multi-Modal Transit Optimizer (MCP)** with Amadeus/Google Flights GDS integration, IRCTC Tatkal waitlist predictors, and redBus connectivity.
3. **10-Minute Heritage Stay Soft-Hold & Lock Manager** to prevent room loss while organizing transit.
4. **Mandatory OTP Payment Authorization Rail** with Cloud KMS encryption and instant ticket issuance.
5. **Distributed Multi-Leg Saga Coordinator** with 100% automated compensatory rollback and instant refund guarantees.

---

## 📐 System Architecture

```mermaid
flowchart TB
    subgraph Client["💻 User Interface Layer (Vite + React + TS)"]
        UI[Glassmorphic Web & Mobile Dashboard]
        Tab1[Cultural Itinerary & Sanctum Attire]
        Tab2[Cheapest Flights, Trains & Buses]
        Tab3[Heritage Stays & 10-Min Soft Hold]
        Tab4[Travel Preferences & History]
        Modal[OTP-Authorized Checkout & Booking Modal]
    end

    subgraph Mesh["⚡ Serverless Agent Mesh (FastAPI on Cloud Run)"]
        Router[FastAPI API Gateway]
        
        subgraph Cognitive["🧠 Cognitive & Cultural Engine"]
            Planner[Gemini 2.5 Flash Itinerary Planner]
            RAG[Cultural RAG Engine]
            MemEngine[30-Day Episodic & Taste Memory]
        end

        subgraph MCP["🔌 Model Context Protocol (MCP) Tools"]
            FlightMCP[flight_finder_mcp: Amadeus / Google Flights]
            TrainMCP[train_finder_mcp: IRCTC Tatkal WL Engine]
            BusMCP[bus_finder_mcp: redBus Intercity]
            OptMCP[Pareto Transit Solver]
            HotelMCP[hotel_hold_manager: 10-Min TTL Lock]
        end

        subgraph Saga["🛡️ Distributed Transaction Engine"]
            Orchestrator[Saga Coordinator]
            Compensator[Automated Compensator & Rollback]
        end

        subgraph Security["🔐 Security & Compliance"]
            KMS[Google Cloud KMS Tokenization]
            DigiLocker[DigiLocker PII Shield]
        end
    end

    subgraph Data["☁️ Google Cloud & External Infrastructure"]
        GCS[(Cultural & Culinary Datasets in GCS)]
        BQ[(BigQuery ML: ARIMA_PLUS & Boosted Trees)]
        Firestore[(Firestore 30-Day Interaction Store)]
        BankRail[NPCI UPI 2.0 & Bank Payment Rail]
    end

    UI --> Router
    Router --> Planner
    Router --> RAG
    Router --> OptMCP
    Router --> HotelMCP
    Router --> Orchestrator

    RAG --> GCS
    Planner --> MemEngine
    MemEngine --> Firestore
    
    OptMCP --> FlightMCP & TrainMCP & BusMCP
    TrainMCP --> BQ
    
    Orchestrator --> HotelMCP
    Orchestrator --> FlightMCP
    Orchestrator --> KMS
    KMS --> BankRail
    Orchestrator --> Compensator
```

---

## 🔄 End-to-End Multi-Leg Saga Booking & OTP Flow

```mermaid
sequenceDiagram
    autonumber
    actor User as Traveler
    participant App as Frontend Client
    participant Mesh as Agent Mesh Gateway
    participant Saga as Saga Orchestrator
    participant Transit as Transit / Airline GDS
    participant Hotel as Hotel Hold Manager
    participant KMS as Cloud KMS & Bank Rail

    User->>App: Selects Flight (e.g. IndiGo 6E-204)
    User->>App: (Optional) Toggles "Add Hotel Stay"
    User->>App: Selects Payment (UPI / Card / NetBanking)
    User->>App: Clicks "Send OTP & Proceed"
    App->>User: Displays 6-Digit OTP Prompt (SMS simulation)
    User->>App: Enters 6-Digit OTP (482910)
    App->>Mesh: POST /api/saga/execute (with OTP verification)
    
    critical Distributed Saga Execution
        Saga->>Transit: GDS Seat Lock & Reservation
        Transit-->>Saga: Confirmed (Airline PNR Issued)
        opt If Hotel Stay Included
            Saga->>Hotel: Room Inventory Lock
            Hotel-->>Saga: Room Secured
        end
        Saga->>KMS: Settle OTP-Authorized Payment
        KMS-->>Saga: Txn Settled (TXN_UPI_...)
        Saga->>App: Issue E-Tickets, Boarding Pass & Tax Invoice
    option Failure / Seat Sold Out
        Saga->>Transit: Cancel Reservation
        Saga->>Hotel: Release Soft Hold
        Saga->>KMS: Execute 100% Instant Refund
        Saga-->>App: Booking Safely Rolled Back (₹0 Debited)
    end
    App-->>User: Displays Digital Tickets & Downloadable Tax Invoice
```

---

## 🍛 Cultural RAG & Dietary Compliance Graph

```mermaid
graph TD
    UserPrompt["Prompt: Spiritual journey with Jain dietary preference"] --> RAGQuery[Cultural RAG Query Processor]
    
    subgraph CuratedDatasets["Curated Datasets in GCS"]
        Culinary[(Culinary Heritage JSON)]
        Temples[(Temples & Dress Codes JSON)]
        Vibes[(Destination Vibes JSON)]
    end

    RAGQuery --> Culinary
    RAGQuery --> Temples
    RAGQuery --> Vibes

    Culinary --> FilterDiet{"Dietary Compliance Filter"}
    FilterDiet -->|Jain| JainRules["Strict: No Onion, Garlic, Potato or Root Vegetables"]
    FilterDiet -->|Sattvic| SattvicRules["Strict: No Onion, Garlic, Pure Vegetarian"]
    FilterDiet -->|Pure Veg| VegRules["Strict: 100% Vegetarian"]

    Temples --> AttireRules["Dress Code Protocol: Men (Dhoti/Kurta), Women (Saree/Salwar), Footwear Rules"]
    
    JainRules --> Synthesis[Gemini 2.5 Cognitive Plan Synthesis]
    AttireRules --> Synthesis
    Synthesis --> OutputPlan[Personalized Day-by-Day Journey & Authentic Meal Recommendations]
```

---

## 🚀 Key Features & MVP Highlights

| Feature Area | Implementation Details |
| :--- | :--- |
| **Cognitive Planner** | Gemini 2.5 Flash synthesizes complete multi-day itineraries with step-by-step transit graphs and ritual schedules. |
| **Cultural & Culinary RAG** | Strict dietary compliance engine filtering authentic regional dishes for Varanasi, Madurai, Rameshwaram, Amritsar, Tirupati, and Kerala. |
| **Sanctum Attire Alerts** | Grounded dress code guidelines for men and women, footwear protocols, Aarti timings, and wheelchair accessibility notes. |
| **Pareto Transit Engine** | Multi-modal solver comparing Lowest Price (Bus), Best Value (Vande Bharat Train with IRCTC WL confirmation chance), and Fastest (Direct Flight). |
| **Autonomous Flight Booking** | Direct airline GDS reservation with instant **Airline PNR**, **E-Ticket Number**, auto seat allocation, and digital boarding pass generation. |
| **10-Min Hotel Soft-Hold** | Ephemeral inventory lock securing heritage stays while the traveler reviews transit options. |
| **Mandatory OTP Verification** | Multi-step payment authorization requiring 6-digit OTP verification across UPI (GPay/PhonePe), Cards, and Net Banking. |
| **Separated Bookings** | Flight, Train, and Bus bookings are completely isolated from accommodation by default, with an optional 1-click bundle checkbox. |
| **Distributed Saga Engine** | Multi-leg transaction coordinator with 100% automated compensatory rollback protecting travelers from partial booking failures. |

---

## 💎 The X-Factors (Why YatraAgent Stands Out)

1. **Zero-Touch Multi-Leg Protection**: In traditional platforms, if a flight gets booked but the return train or hotel fails, travelers face manual cancellations and steep penalties. YatraAgent's Saga Coordinator makes multi-leg bookings **atomic**—all succeed together, or everything is automatically refunded with zero cancellation fees.
2. **Culturally Aware Cognitive Engine**: Travel apps fail in India when they suggest non-vegetarian dining in sacred zones or ignore temple dress codes. YatraAgent natively understands Vedic temple customs, Aarti timings, and strict Jain/Sattvic dietary rules.
3. **BigQuery ML Tatkal & Fare Forecaster**: Evaluates historical rail waitlists and flight pricing trends to recommend the mathematically optimal booking window.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons
- **Backend API**: Python 3.11+, FastAPI, Uvicorn, Pydantic
- **AI & Reasoning**: Google Gemini 2.5 Flash / Pro, Retrieval-Augmented Generation (RAG)
- **Analytics & ML**: Google BigQuery ML (ARIMA_PLUS & Boosted Trees)
- **Security & Privacy**: Google Cloud KMS (Envelope Encryption AES-256-GCM), DigiLocker tokenization
- **Orchestration**: Cloud Workflows, Distributed Saga Coordinator

---

## 💻 Local Setup & Quickstart Guide

### Prerequisites
- Node.js v18+ & npm
- Python 3.10+ & pip
- Git

### 1. Clone Repository
```bash
git clone https://github.com/Jivikadixit/YatraAgent.git
cd YatraAgent
```

### 2. Start Backend Agent Mesh Server
```bash
# Navigate to project root
cd c:/Google_Patchmomma/YatraAgent/agent-mesh

# Install dependencies
pip install -r requirements.txt

# Run FastAPI Server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
*API Swagger Documentation is available at `http://127.0.0.1:8000/docs`*

### 3. Start Frontend Client
```bash
# Navigate to frontend folder
cd c:/Google_Patchmomma/YatraAgent/frontend

# Install dependencies
npm install

# Start Vite Development Server
npm run dev
```
*Dashboard will open at `http://localhost:5173/`*

---

## 🧪 Automated Testing

Run the comprehensive 8-stage automated test suite:
```bash
python test_mesh_server.py
```

**Test Suite Coverage:**
```text
--- 1. Testing Cultural RAG Engine --- [OK]
--- 2. Testing Cognitive Itinerary Planner --- [OK]
--- 3. Testing MCP Transit Optimizer & IRCTC BQML --- [OK]
--- 4. Testing 10-Minute Hotel Soft Hold Manager --- [OK]
--- 5. Testing Google Cloud KMS Security Rails --- [OK]
--- 6. Testing BigQuery ML Dynamic Forecasts --- [OK]
--- 7. Testing Distributed Saga Booking & OTP Protection --- [OK]
--- 8. Testing Saga Chaos Compensatory Rollback --- [OK]

[SUCCESS] ALL 8 TESTS PASSED WITH 100% SPECIFICATION CONFORMANCE!
```

---

## 📄 License & Attribution

Built with ❤️ by **Jivika Dixit** using Google Cloud, Gemini 2.5, and the Antigravity Agentic Platform.
Licensed under the [MIT License](LICENSE).
