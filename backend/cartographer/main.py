import os
import json
from google.cloud import pubsub_v1
from google.cloud import bigquery
from dotenv import load_dotenv

load_dotenv()

PROJECT_ID = os.getenv("GCP_PROJECT_ID")
SUBSCRIPTION_ID = "pulse-analyzed-events-sub"
DATASET_ID = "crowd_pulse"
TABLE_ID = "live_sentiment"

def callback(message):
    try:
        payload = json.loads(message.data.decode("utf-8"))
        
        # Prepare row for BigQuery
        row = {
            "timestamp": payload.get("timestamp"),
            "source": payload.get("source"),
            "city": payload.get("geo_hint"),
            "raw_text": payload.get("raw_text"),
            "emojis": payload.get("emojis"),
            "primary_emotion": payload.get("primary_emotion"),
            "intensity": payload.get("intensity")
        }
        
        # Insert into BigQuery
        client = bigquery.Client(project=PROJECT_ID)
        table_ref = client.dataset(DATASET_ID).table(TABLE_ID)
        errors = client.insert_rows_json(table_ref, [row])
        
        if not errors:
            print(f"Inserted row into BigQuery: {row['primary_emotion']} - {row['intensity']}")
            message.ack()
        else:
            print(f"Errors occurred while inserting rows: {errors}")
            message.nack()
            
    except Exception as e:
        print(f"Error in Cartographer: {e}")
        message.nack()

def listen_for_messages():
    subscriber = pubsub_v1.SubscriberClient()
    subscription_path = subscriber.subscription_path(PROJECT_ID, SUBSCRIPTION_ID)
    
    print(f"Cartographer Agent listening on {subscription_path}...")
    
    streaming_pull_future = subscriber.subscribe(subscription_path, callback=callback)
    try:
        streaming_pull_future.result()
    except KeyboardInterrupt:
        streaming_pull_future.cancel()

if __name__ == "__main__":
    listen_for_messages()
