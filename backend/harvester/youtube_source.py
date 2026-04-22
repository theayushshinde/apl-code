import pytchat
import json
import time

def get_youtube_chat(video_id):
    chat = pytchat.create(video_id=video_id)
    while chat.is_alive():
        for c in chat.get().sync_items():
            # Standardized payload
            payload = {
                "source": "YouTube",
                "raw_text": c.message,
                "emojis": extract_emojis(c.message), # Emojis are preserved in c.message
                "geo_hint": "Unknown", # Can't get precise geo from chat, default to unknown or infer
                "timestamp": c.datetime
            }
            yield payload
        time.sleep(1)
    
def extract_emojis(text):
    import emoji
    # Returns a string of all emojis found in the text
    return "".join(c for c in text if c in emoji.EMOJI_DATA)

if __name__ == "__main__":
    import os
    from dotenv import load_dotenv
    load_dotenv()
    vid = os.getenv("YOUTUBE_VIDEO_ID", "_PoHRlCv8RE")
    print(f"Listening to YouTube Live: {vid}")
    for msg in get_youtube_chat(vid):
        print(msg)
