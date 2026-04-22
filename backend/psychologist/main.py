import os
import json
import time
from dotenv import load_dotenv
from google.cloud import pubsub_v1
from gemini_analyzer import analyze_emotion

load_dotenv()

PROJECT_ID = os.getenv("GCP_PROJECT_ID")
SUBSCRIPTION_ID = "pulse-raw-events-sub"
PUBLISH_TOPIC_ID = "pulse-analyzed-events"

def callback(message):
    try:
        payload = json.loads(message.data.decode("utf-8"))
        raw_text = payload.get("raw_text", "")
        emojis = payload.get("emojis", "")
        
        # Call Gemini
        result_str = analyze_emotion(raw_text, emojis)
        result = json.loads(result_str)
        
        # Enrich payload
        payload["primary_emotion"] = result.get("primary_emotion", "Neutral")
        payload["intensity"] = result.get("intensity", 0.0)
        
        print(f"Analyzed: {raw_text} -> {payload['primary_emotion']} ({payload['intensity']})")
        
        # Publish to next topic
        publisher = pubsub_v1.PublisherClient()
        topic_path = publisher.topic_path(PROJECT_ID, PUBLISH_TOPIC_ID)
        
        data_str = json.dumps(payload)
        publisher.publish(topic_path, data_str.encode("utf-8"))
        
        message.ack()
    except Exception as e:
        print(f"Error processing message: {e}")
        message.nack()

def listen_for_messages():
    subscriber = pubsub_v1.SubscriberClient()
    subscription_path = subscriber.subscription_path(PROJECT_ID, SUBSCRIPTION_ID)
    
    print(f"Psychologist Agent listening on {subscription_path}...")
    
    streaming_pull_future = subscriber.subscribe(subscription_path, callback=callback)
    try:
        streaming_pull_future.result()
    except KeyboardInterrupt:
        streaming_pull_future.cancel()

if __name__ == "__main__":
    listen_for_messages()
