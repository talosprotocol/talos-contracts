# Talos v1.2 Core Semantics

## 1. Event Ordering (Cursors)

To ensure reliable, gap-less consumption of the audit log in a distributed system, we define the `cursor` as the primary ordering key.

### 1.1 Cursor Format

Legacy v1: `base64(timestamp_ms:event_id)`
**v1.2 Standard**: `base64(timestamp_ms:uuid_v7)`

- **Timestamp**: Milliseconds since Unix epoch. Source of truth is the Gateway ingestion time.
- **UUIDv7**: Time-ordered UUID. Provides collision resistance and monotonic sorting within the same millisecond.

### 1.2 Ordering Rule

Events MUST be strictly ordered by `cursor` lexicographically.

- Since the cursor prefix is `timestamp_ms`, this approximates time-ordering.
- In case of timestamp collision, the UUIDv7 suffix acts as the tie-breaker.

### 1.3 Resume Semantics (Exclusive)

All list/stream operations use **Exclusive Cursors**.

- Parameter: `after_cursor` (or `start_cursor`).
- Behavior: Return events where `event.cursor > provided_cursor`.
- Rationale: Allows safe polling loops without duplicating the last seen event.

---

## 2. Event Integrity & Uniqueness

### 2.1 Event ID Uniqueness

The `event_id` is globally unique.

- Scope: All tenants, all regions.
- Collision Policy: Any attempt to write an event with an existing `event_id` MUST fail (idempotency) or be ignored (deduplication).

### 2.2 Deduplication

Client libraries (Dashboard, Agents) MUST implement deduplication.

- **Key**: `event_id`.
- **Window**: Clients should retain a sliding window of recent `event_id`s (e.g., last 5 minutes) to handle "At-Least-Once" duplicates.

---

## 3. Delivery Guarantees (WebSocket & Export)

### 3.1 Streaming: At-Least-Once

The Talos Gateway WebSocket API guarantees **At-Least-Once** delivery.

- If a connection drops and resumes with `after_cursor`, the server REPLAYS all events after that cursor.
- Due to distributed persistence creation lag, a "late arrival" event might be inserted with a timestamp slightly in the past.
  - _Implementation Note_: The Gateway `list` query logic must handle "eventual consistency" windows (e.g., by delaying query results by a few milliseconds or using a sequence generator if Postgres is the single source of truth). For v1.2 with Postgres as Single Leader, strong consistency is assumed for the `cursor` index.

### 3.2 Backpressure

- **Slow Consumer Policy**: DISCONNECT.
- If a client cannot keep up with the stream (TCP buffers full, server queue full), the Gateway MUST send `CLOSE_CODE=4000 (Slow Consumer)` and terminate the connection.
- The client is expected to reconnect and resume from its last processed cursor.
