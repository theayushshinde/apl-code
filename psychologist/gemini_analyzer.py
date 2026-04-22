import os
from google import genai
from google.genai import types

# Use google-genai SDK for Gemini 1.5 Flash
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

def analyze_emotion(text, emojis):
    prompt = f"""
    Analyze this cricket chat fragment. Identify the primary emotion and intensity (0.0 to 1.0).
    Consider the following emojis deeply, as they carry high emotional weight: {emojis}
    
    Chat Text: "{text}"
    
    Respond STRICTLY in JSON format with two keys:
    - primary_emotion: Must be one of ["Euphoria", "Tension", "Disbelief", "Frustration", "Neutral"]
    - intensity: A float between 0.0 and 1.0
    """
    
    try:
        response = client.models.generate_content(
            model='gemini-1.5-flash',
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        return response.text
    except Exception as e:
        print(f"Gemini API Error: {e}")
        return '{"primary_emotion": "Neutral", "intensity": 0.0}'
