"use client";

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { Activity, Zap, MessageCircle, AlertTriangle, TrendingUp, RefreshCw } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState<{ graph: any[], moments: any[], distribution: any[] }>({ graph: [], moments: [], distribution: [] });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/sentiment');
      const result = await res.json();
      if (!result.error) {
        setData({
          graph: result.graph || [],
          moments: result.moments || [],
          distribution: result.distribution || []
        });
      }
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000); // Poll every 3 seconds
    return () => clearInterval(interval);
  }, []);

  const COLORS = {
    Euphoria: '#3b82f6', // blue
    Tension: '#f59e0b', // amber
    Disbelief: '#a855f7', // purple
    Frustration: '#ef4444', // red
    Neutral: '#64748b' // slate
  };

  // Get latest intensity
  const currentIntensity = data.graph.length > 0 ? data.graph[data.graph.length - 1].intensity : 0;
  const statusColor = currentIntensity > 0.8 ? 'text-red-500' : currentIntensity > 0.5 ? 'text-amber-500' : 'text-emerald-500';

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6 font-sans">
      {/* Header */}
      <header className="flex justify-between items-center mb-8 border-b border-neutral-800 pb-4">
        <div className="flex items-center gap-3">
          <Activity className="text-blue-500 w-8 h-8" />
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            Crowd Pulse
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-neutral-900 rounded-full border border-neutral-800">
            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
            <span className="text-sm font-medium text-neutral-300">LIVE</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Heatmap Graph */}
        <div className="lg:col-span-2 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-red-500"></div>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neutral-400" />
                Global Intensity Heatmap
              </h2>
              <p className="text-sm text-neutral-500">Real-time emotional volatility across all tracked chats</p>
            </div>
            <div className="text-right">
              <div className={`text-4xl font-bold ${statusColor}`}>
                {(currentIntensity * 100).toFixed(0)}%
              </div>
              <p className="text-xs text-neutral-500 uppercase tracking-wider font-semibold">Pulse Rate</p>
            </div>
          </div>
          
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.graph} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="time" stroke="#525252" fontSize={12} tickLine={false} />
                <YAxis stroke="#525252" fontSize={12} tickLine={false} domain={[0, 1]} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
                  itemStyle={{ color: '#e5e5e5' }}
                />
                <Area type="monotone" dataKey="intensity" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorIntensity)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Emotion Distribution */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold mb-2">Crowd Emotion Split</h2>
          <p className="text-sm text-neutral-500 mb-6">Distribution of primary emotions in the last hour</p>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || COLORS.Neutral} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mt-4">
            {data.distribution.map((d: any) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[d.name as keyof typeof COLORS] || COLORS.Neutral }}></div>
                <span className="text-sm text-neutral-300">{d.name}</span>
                <span className="text-sm font-semibold ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Viral Moments Feed */}
        <div className="lg:col-span-3 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-xl mt-2">
          <h2 className="text-xl font-semibold mb-1 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Viral Moment Cards
          </h2>
          <p className="text-sm text-neutral-500 mb-6">High-intensity messages automatically flagged for the broadcaster overlay</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {data.moments.length === 0 ? (
              <div className="col-span-5 text-center py-10 text-neutral-500">
                <RefreshCw className="w-8 h-8 mx-auto mb-3 animate-spin text-neutral-700" />
                Waiting for high-intensity spikes...
              </div>
            ) : (
              data.moments.map((moment: any, idx: number) => (
                <div key={idx} className="bg-neutral-950 border border-neutral-800 rounded-xl p-4 flex flex-col justify-between hover:border-neutral-600 transition-colors">
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-mono text-neutral-500">{moment.time}</span>
                      <span className="px-2 py-1 text-[10px] font-bold uppercase rounded-md" 
                        style={{ 
                          backgroundColor: `${COLORS[moment.primary_emotion as keyof typeof COLORS]}20`,
                          color: COLORS[moment.primary_emotion as keyof typeof COLORS] 
                        }}>
                        {moment.primary_emotion}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-200 line-clamp-3 mb-2">&quot;{moment.raw_text}&quot;</p>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div className="text-2xl">{moment.emojis}</div>
                    <div className="text-right">
                      <div className="text-xs text-neutral-500">Intensity</div>
                      <div className="font-bold text-lg" style={{ color: COLORS[moment.primary_emotion as keyof typeof COLORS] }}>
                        {(moment.intensity * 10).toFixed(1)}/10
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
