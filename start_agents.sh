#!/bin/bash
echo "Starting Crowd Pulse Pipeline..."

# Start the Next.js frontend in the background
echo "Starting Next.js Frontend on port 3000..."
(cd frontend && npm run dev > ../frontend.log 2>&1) &
FRONTEND_PID=$!

# Start the Cartographer (BigQuery Writer)
echo "Starting Cartographer Agent..."
python3.12 cartographer/main.py > cartographer.log 2>&1 &
CARTOGRAPHER_PID=$!

# Start the Psychologist (Gemini Analysis)
echo "Starting Psychologist Agent..."
python3.12 psychologist/main.py > psychologist.log 2>&1 &
PSYCHOLOGIST_PID=$!

# Start the Harvester (YouTube chat)
echo "Starting Harvester Agent..."
python3.12 harvester/main.py

# When Harvester stops, kill the other processes
kill $FRONTEND_PID $CARTOGRAPHER_PID $PSYCHOLOGIST_PID
echo "Crowd Pulse Pipeline Stopped."
