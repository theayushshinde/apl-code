import os
from google.cloud import pubsub_v1
from google.cloud import bigquery
from google.api_core.exceptions import AlreadyExists
from dotenv import load_dotenv

load_dotenv()

PROJECT_ID = os.getenv("GCP_PROJECT_ID")

if not PROJECT_ID:
    raise ValueError("GCP_PROJECT_ID not found in .env")

# Pub/Sub topics & subscriptions
TOPICS = ["pulse-raw-events", "pulse-analyzed-events"]
SUBSCRIPTIONS = {
    "pulse-raw-events": "pulse-raw-events-sub",
    "pulse-analyzed-events": "pulse-analyzed-events-sub"
}

# BigQuery details
DATASET_ID = "crowd_pulse"
TABLE_ID = "live_sentiment"

def setup_pubsub():
    publisher = pubsub_v1.PublisherClient()
    subscriber = pubsub_v1.SubscriberClient()
    
    for topic_name in TOPICS:
        topic_path = publisher.topic_path(PROJECT_ID, topic_name)
        try:
            publisher.create_topic(request={"name": topic_path})
            print(f"Created topic: {topic_path}")
        except AlreadyExists:
            print(f"Topic {topic_path} already exists.")

        sub_name = SUBSCRIPTIONS[topic_name]
        subscription_path = subscriber.subscription_path(PROJECT_ID, sub_name)
        try:
            subscriber.create_subscription(request={"name": subscription_path, "topic": topic_path})
            print(f"Created subscription: {subscription_path}")
        except AlreadyExists:
            print(f"Subscription {subscription_path} already exists.")

def setup_bigquery():
    client = bigquery.Client(project=PROJECT_ID)
    
    dataset_ref = client.dataset(DATASET_ID)
    dataset = bigquery.Dataset(dataset_ref)
    dataset.location = "US"
    
    try:
        client.create_dataset(dataset)
        print(f"Created dataset {client.project}.{dataset.dataset_id}")
    except AlreadyExists:
        print(f"Dataset {client.project}.{dataset.dataset_id} already exists")

    table_ref = dataset_ref.table(TABLE_ID)
    schema = [
        bigquery.SchemaField("timestamp", "TIMESTAMP", mode="REQUIRED"),
        bigquery.SchemaField("source", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("city", "STRING", mode="NULLABLE"),
        bigquery.SchemaField("raw_text", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("emojis", "STRING", mode="NULLABLE"),
        bigquery.SchemaField("primary_emotion", "STRING", mode="REQUIRED"),
        bigquery.SchemaField("intensity", "FLOAT", mode="REQUIRED"),
    ]
    table = bigquery.Table(table_ref, schema=schema)
    
    try:
        client.create_table(table)
        print(f"Created table {table.project}.{table.dataset_id}.{table.table_id}")
    except AlreadyExists:
        print(f"Table {table.project}.{table.dataset_id}.{table.table_id} already exists")

if __name__ == "__main__":
    print(f"Setting up GCP resources for project: {PROJECT_ID}")
    setup_pubsub()
    setup_bigquery()
    print("Setup complete.")
