CREATE TABLE IF NOT EXISTS airports (
  iata      CHAR(3)     NOT NULL,
  name      VARCHAR(64) NOT NULL,
  timezone  VARCHAR(64) NOT NULL,
  PRIMARY KEY (iata)
);

CREATE TABLE IF NOT EXISTS flight_schedule (
  flight_id        VARCHAR(32) NOT NULL,
  flight_number    VARCHAR(16) NOT NULL,
  flight_date      DATE        NOT NULL,
  std_local        DATETIME    NOT NULL,
  sta_local        DATETIME    NOT NULL,
  std_utc          DATETIME    NOT NULL,
  sta_utc          DATETIME    NOT NULL,
  std_offset_min   SMALLINT    NOT NULL,
  sta_offset_min   SMALLINT    NOT NULL,
  flight_time_min  SMALLINT    NOT NULL,
  from_iata        CHAR(3)     NOT NULL,
  to_iata          CHAR(3)     NOT NULL,
  from_city        VARCHAR(64) NOT NULL,
  to_city          VARCHAR(64) NOT NULL,
  PRIMARY KEY (flight_id),
  KEY idx_from_std (from_iata, std_utc),
  KEY idx_to_sta (to_iata, sta_utc)
);
