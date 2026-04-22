# PRD: Crowd Pulse v2.0 — Multi-Source Emotional Intelligence

## 1. Executive Summary
Crowd Pulse is a real-time "Second Screen" engine that captures the emotional fingerprint of a cricket match. By triangulating data from YouTube, Reddit, X, and WhatsApp, it generates a high-fidelity "Intensity Score" that filters out local noise to find truly global viral moments.

## 2. Updated Core Features

### 2.1. Multi-Source Triangulation (The Reliability Filter)
* **Weighted Aggregation:** Instead of treating all data equally, the system assigns weights based on source quality (e.g., Reddit "Expert" pulse vs. YouTube "Volume" pulse).
* **Cross-Platform Validation:** An emotional "spike" is only marked as high-reliability if detected across 2+ platforms simultaneously.

### 2.2. Emoji-First Sentiment Analysis
* **Direct Ingestion:** Agent 1 preserves all UTF-8 characters.
* **Visual Nuance:** Emojis like 🤯 (Disbelief), 🔥 (Hype), and 🧊 (Pressure) are treated as primary intensity triggers, often weighted higher than text-based slang.

### 2.3. The "City-Pulse" Heatmap (Indore vs. Mumbai vs. Bangalore)
* **Hyper-Local Sentiment:** Using metadata and dialect-specific keywords to map frustration or euphoria to specific fanbases. 
* **Rivalry Tracking:** Real-time comparison of "Heart Rates" between competing team home bases.

## 3. The Agent Workflow (Updated)

### Agent 1: The Modular Harvester (Input)
* **Plugin Architecture:** Separate listeners for YouTube Chat, Reddit Live, and Mock-X/WhatsApp feeds.
* **Standardized Payload:** Every source outputs a uniform JSON containing `source`, `raw_text`, `emojis`, and `geo_hint`.

### Agent 2: The Psychologist (Inference)
* **LLM Engine:** Gemini 1.5 Flash.
* **Role:** Categorizes raw data into one of 5 emotional buckets: *Euphoria, Tension, Disbelief, Frustration, Neutral.*
* **Intensity Mapping:** Assigns a 0.0-1.0 score based on emoji density and word choice.

### Agent 3: The Cartographer (Validation & Analytics)
* **Platform:** BigQuery.
* **Cohesion Logic:** Calculates a "Consensus Score." If YouTube and Reddit align on a "Euphoria" spike, the Intensity Score glows "Electric Blue." If they diverge, the score remains "Dim."

### Agent 4: The Creative Director (Output)
* **Role:** Automated "Moment Card" generation. 
* **Trigger:** Alerts broadcasters when the Global Intensity Score exceeds 0.9.

## 4. Technical Constraints (2-Hour PoC)
* **Data Strategy:** Use the **YouTube Data API** for live signal and **Python-based mock generators** for Reddit/X to demonstrate the triangulation logic without API wait times.
* **Latency Goal:** < 3 seconds from "Wicket Taken" to "Heatmap Update."

## 5. Success Metrics
* **Signal-to-Noise Ratio:** Ability to filter out "Hi" and "Hello" spam in YouTube chat.
* **Broadcaster Alignment:** How closely the "Emotional Overlays" match the actual visual drama on screen.
