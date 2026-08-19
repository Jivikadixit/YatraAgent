-- BigQuery Data Warehouse DDL for YatraAgent Multi-Agent Ecosystem
-- Dataset: yatra_agent_analytics

CREATE SCHEMA IF NOT EXISTS `yatra_agent_analytics`
OPTIONS(
  location = 'asia-south1',
  description = 'YatraAgent Real-time Multi-Modal Travel Analytics & BQML Models'
);

-- 1. 30-Day Session State & Episodic Memory Table
CREATE TABLE IF NOT EXISTS `yatra_agent_analytics.user_episodic_memory` (
  session_id STRING NOT NULL,
  user_id STRING NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  expires_at TIMESTAMP DEFAULT TIMESTAMP_ADD(CURRENT_TIMESTAMP(), INTERVAL 30 DAY),
  dietary_profile STRING, -- 'Jain', 'Sattvic', 'Pure Veg', 'Vegan', 'Halal', 'Any'
  budget_preference STRING, -- 'Budget', 'Value_Optimizer', 'Luxury_Comfort'
  preferred_transit_modes ARRAY<STRING>, -- ['FLIGHT', 'VANDE_BHARAT_2A', 'VOLVO_AC_BUS']
  cultural_strictness_score FLOAT64, -- 0.0 to 1.0 (propensity for strict traditional attire & darshan schedules)
  taste_vector_embedding ARRAY<FLOAT64>, -- 768-dim dense embedding from Gemini Text-Embedding-004
  last_visited_destinations ARRAY<STRING>,
  metadata JSON
)
PARTITION BY DATE(created_at)
CLUSTER BY user_id, session_id;

-- 2. IRCTC Historical PNR Waitlist Transition Table (For BQML Waitlist Predictor)
CREATE TABLE IF NOT EXISTS `yatra_agent_analytics.irctc_waitlist_history` (
  pnr_hash STRING NOT NULL,
  train_number STRING NOT NULL,
  train_name STRING,
  origin_station STRING,
  destination_station STRING,
  journey_date DATE NOT NULL,
  travel_class STRING NOT NULL, -- '1A', '2A', '3A', 'SL', 'CC', 'EC'
  booking_quota STRING NOT NULL, -- 'GN', 'TQ' (Tatkal), 'PT' (Premium Tatkal), 'LD' (Ladies)
  booking_day_offset INT64, -- Days before departure when ticket was booked
  initial_waitlist_number INT64 NOT NULL,
  charting_status STRING NOT NULL, -- 'CNF', 'RAC', 'WL_DROPPED', 'CAN'
  final_outcome_confirmed INT64 NOT NULL -- 1 if Confirmed/RAC with berth, 0 if remained WL
)
PARTITION BY journey_date
CLUSTER BY train_number, travel_class, booking_quota;

-- 3. Dynamic Transit Fares & Demand Timeseries
CREATE TABLE IF NOT EXISTS `yatra_agent_analytics.transit_fare_timeseries` (
  route_id STRING NOT NULL,
  origin_city STRING NOT NULL,
  destination_city STRING NOT NULL,
  transit_mode STRING NOT NULL, -- 'FLIGHT', 'TRAIN', 'BUS'
  operator_name STRING NOT NULL,
  observed_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  departure_datetime TIMESTAMP NOT NULL,
  base_fare_inr FLOAT64 NOT NULL,
  current_surge_multiplier FLOAT64 DEFAULT 1.0,
  seats_remaining INT64,
  festival_season_flag BOOL DEFAULT FALSE
)
PARTITION BY DATE(observed_timestamp)
CLUSTER BY origin_city, destination_city, transit_mode;

-- 4. Multi-Leg Booking Saga Audit & Compensation Ledger
CREATE TABLE IF NOT EXISTS `yatra_agent_analytics.booking_saga_audit_ledger` (
  saga_id STRING NOT NULL,
  user_id STRING NOT NULL,
  saga_status STRING NOT NULL, -- 'INITIATED', 'HOLD_RESERVED', 'PAYMENT_AUTHORIZED', 'COMPLETED', 'FAILED_COMPENSATING', 'REFUND_SETTLED'
  total_amount_inr FLOAT64 NOT NULL,
  legs JSON, -- Flight PNR, Train PNR, Bus Seat, Hotel Hold ID
  kms_payment_token_hash STRING NOT NULL,
  compensation_trigger_reason STRING,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP(),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
PARTITION BY DATE(created_at)
CLUSTER BY saga_id, saga_status;
