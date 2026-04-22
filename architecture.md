# Technical Architecture: Crowd Pulse

## Overview
Crowd Pulse uses a **Multi-Agent Event-Driven Architecture** built on Google Cloud. It leverages Gemini 1.5 Flash for high-speed NLP and BigQuery for real-time analytical heavy lifting.

## 1. Data Flow (The Pulse Pipeline)

### Agent 1: The Harvester (Ingestion)
* **Runtime:** Cloud Run (Python/FastAPI).
* **Inputs:** * YouTube Data API (Live Chat).
    * X (Twitter) Stream API (Filtering #IPL, #MatchTags).
    * WhatsApp Business Webhooks (Incoming fan group data).
* **Logic:** Cleans HTML/metadata. **Crucial:** Extracts and preserves emojis as they carry 70% of the emotional weight in high-speed chats.
* **Output:** Publishes a JSON payload to **Cloud Pub/Sub**.

### Agent 2: The Psychologist (Inference)
* **Runtime:** Cloud Run triggered by Pub/Sub.
* **Model:** **Gemini 1.5 Flash** (Vertex AI).
* **Prompting:** * "Analyze this cricket chat fragment. Identify the primary emotion (Euphoria, Tension, Anger) and intensity (0.0-1.0). Consider these emojis: {emojis}."
* **Output:** Structured JSON sent to the next Pub/Sub topic.

### Agent 3: The Cartographer (Aggregation)
* **Runtime:** **BigQuery Write API** (Streaming Inserts).
* **Logic:** * Performs windowed aggregation (e.g., "Last 60 seconds").
    * Calculates the "City-Wise Pulse" by joining IP/User metadata with geography tables.
* **Storage:** `crowd_pulse.live_sentiment` table.

### Agent 4: The Creative Director (Trigger)
* **Runtime:** Cloud Function.
* **Trigger:** BigQuery "Alert" (When intensity > 0.9).
* **Logic:** Summarizes the 'why' behind the spike and saves a "Moment Card" metadata entry for the UI.

## 2. Technology Stack
| Component | Technology | Why? |
| :--- | :--- | :--- |
| **Compute** | Cloud Run | Scale to zero when match ends; handles bursts during wickets. |
| **Messaging** | Pub/Sub | Decouples ingestion from heavy AI processing. |
| **Brain** | Gemini 1.5 Flash | Low latency (sub-second) and high context window for slang. |
| **Warehouse** | BigQuery | Real-time SQL analytics and Looker integration. |
| **Visualization** | Looker Studio / React | For the neon heatmap and Broadcaster Overlay. |

## 3. Scalability & DevOps
* **CI/CD:** GitHub Actions to Cloud Run.
* **Monitoring:** Cloud Monitoring to track "Message Drop Rate" during peak overs (e.g., Dhoni coming to crease).
* **Geographic Distribution:** Deployed in `asia-south1` (Mumbai) for minimum latency to Indian fans.
