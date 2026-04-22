import os
import json
import time
from dotenv import load_dotenv
from google.cloud import pubsub_v1
from youtube_source import get_youtube_chat

load_dotenv()

PROJECT_ID = os.getenv("GCP_PROJECT_ID")
TOPIC_ID = "pulse-raw-events"
YOUTUBE_VIDEO_ID = os.getenv("YOUTUBE_VIDEO_ID", "_PoHRlCv8RE")

def publish_messages():
    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(PROJECT_ID, TOPIC_ID)

    print(f"Starting Harvester Agent for Video ID: {YOUTUBE_VIDEO_ID}")
    
    try:
        for payload in get_youtube_chat(YOUTUBE_VIDEO_ID):
            data_str = json.dumps(payload)
            data = data_str.encode("utf-8")
            
            try:
                future = publisher.publish(topic_path, data)
                message_id = future.result()
                print(f"Published message ID: {message_id} | {payload['raw_text']}")
            except Exception as e:
                print(f"Failed to publish to Pub/Sub: {e}. Falling back to print.")
                print(f"Payload: {data_str}")
    except Exception as e:
        print(f"Error in Harvester: {e}")

if __name__ == "__main__":
    publish_messages()
