-- BigQuery ML (BQML) Model: IRCTC Tatkal & Waitlist Confirmation Probability Predictor
-- Uses Boosted Tree Classifier over historical PNR transitions, booking quotas, and seasonal trends

CREATE OR REPLACE MODEL `yatra_agent_analytics.irctc_confirmation_predictor_model`
OPTIONS(
  model_type = 'BOOSTED_TREE_CLASSIFIER',
  input_label_cols = ['final_outcome_confirmed'],
  max_iterations = 50,
  learn_rate = 0.1,
  tree_method = 'HIST',
  subsample = 0.85,
  auto_class_weights = TRUE,
  data_split_method = 'AUTO_SPLIT'
) AS
SELECT
  train_number,
  origin_station,
  destination_station,
  travel_class,
  booking_quota,
  booking_day_offset,
  initial_waitlist_number,
  EXTRACT(DAYOFWEEK FROM journey_date) AS day_of_week,
  EXTRACT(MONTH FROM journey_date) AS journey_month,
  final_outcome_confirmed
FROM
  `yatra_agent_analytics.irctc_waitlist_history`
WHERE
  journey_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY);

-- Inference SQL Query: Predict probability of confirmation for an active search
/*
SELECT
  train_number,
  travel_class,
  initial_waitlist_number,
  predicted_final_outcome_confirmed_probs[OFFSET(1)].prob AS confirmation_probability
FROM
  ML.PREDICT(
    MODEL `yatra_agent_analytics.irctc_confirmation_predictor_model`,
    (
      SELECT
        '20104' AS train_number,
        'BSB' AS origin_station,
        'NDLS' AS destination_station,
        '3A' AS travel_class,
        'GN' AS booking_quota,
        4 AS booking_day_offset,
        14 AS initial_waitlist_number,
        6 AS day_of_week,
        10 AS journey_month
    )
  );
*/
