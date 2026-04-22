import { NextResponse } from 'next/server';
import { BigQuery } from '@google-cloud/bigquery';

const projectId = process.env.GCP_PROJECT_ID;
const bigquery = new BigQuery({ projectId });

export async function GET() {
  try {
    // Query 1: Time-series aggregated by minute
    const graphQuery = `
      SELECT 
        FORMAT_TIMESTAMP('%H:%M', TIMESTAMP_TRUNC(timestamp, MINUTE)) as time,
        AVG(intensity) as intensity,
        primary_emotion
      FROM \`${projectId}.crowd_pulse.live_sentiment\`
      WHERE timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
      GROUP BY time, primary_emotion
      ORDER BY time ASC
    `;
    
    // Query 2: Recent high-intensity moments
    const momentsQuery = `
      SELECT 
        FORMAT_TIMESTAMP('%H:%M:%S', timestamp) as time,
        raw_text, 
        emojis, 
        primary_emotion, 
        intensity
      FROM \`${projectId}.crowd_pulse.live_sentiment\`
      WHERE intensity >= 0.7
      ORDER BY timestamp DESC
      LIMIT 5
    `;

    // Query 3: Emotion Distribution (Overall)
    const distributionQuery = `
      SELECT 
        primary_emotion as name,
        COUNT(*) as value
      FROM \`${projectId}.crowd_pulse.live_sentiment\`
      WHERE timestamp > TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 1 HOUR)
      GROUP BY primary_emotion
    `;

    const [graphRows] = await bigquery.query({ query: graphQuery });
    const [momentsRows] = await bigquery.query({ query: momentsQuery });
    const [distributionRows] = await bigquery.query({ query: distributionQuery });

    // Format graph data to group by time
    const timeMap = new Map();
    graphRows.forEach((row: any) => {
      if (!timeMap.has(row.time)) {
        timeMap.set(row.time, { time: row.time, avgIntensity: 0, count: 0, emotions: {} });
      }
      const entry = timeMap.get(row.time);
      entry.avgIntensity += row.intensity;
      entry.count += 1;
      entry.emotions[row.primary_emotion] = row.intensity;
    });

    const formattedGraph = Array.from(timeMap.values()).map((entry: any) => ({
      time: entry.time,
      intensity: entry.avgIntensity / entry.count,
      ...entry.emotions
    }));

    return NextResponse.json({
      graph: formattedGraph,
      moments: momentsRows,
      distribution: distributionRows
    });
  } catch (error) {
    console.error("BigQuery Error:", error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
