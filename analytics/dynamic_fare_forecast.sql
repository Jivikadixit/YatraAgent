-- BigQuery ML (BQML) Time-Series Forecasting Model for Dynamic Transit Fares & Price Drop Alerts
-- Uses ARIMA_PLUS to model seasonal demand spikes, festival rushes, and forecast 7-day lowest price windows

CREATE OR REPLACE MODEL `yatra_agent_analytics.dynamic_fare_forecaster_model`
OPTIONS(
  model_type = 'ARIMA_PLUS',
  time_series_timestamp_col = 'observed_timestamp',
  time_series_data_col = 'base_fare_inr',
  time_series_id_col = 'route_id',
  holiday_region = 'IN', -- Indian national & regional holidays awareness
  auto_arima = TRUE,
  data_frequency = 'AUTO_FREQUENCY',
  decompose_time_series = TRUE
) AS
SELECT
  route_id,
  observed_timestamp,
  base_fare_inr
FROM
  `yatra_agent_analytics.transit_fare_timeseries`
WHERE
  observed_timestamp >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 90 DAY);

-- Inference Query: Forecast lowest fare window in next 7 days for flight/train routes
/*
SELECT
  route_id,
  forecast_timestamp,
  forecast_value AS predicted_fare_inr,
  prediction_interval_lower_bound AS best_case_inr,
  prediction_interval_upper_bound AS surge_ceiling_inr
FROM
  ML.FORECAST(
    MODEL `yatra_agent_analytics.dynamic_fare_forecaster_model`,
    STRUCT(7 AS horizon, 0.9 AS confidence_level)
  );
*/
