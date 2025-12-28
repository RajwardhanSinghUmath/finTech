'use client';
import React, { useEffect, useState } from 'react';
import { useSupabaseLogger } from '@/hooks/useSupabaseLogger';


const calculateAvg = (arr) => {
    if (!arr || arr.length === 0) return 0;
    const sum = arr.reduce((a, b) => a + b, 0);
    return (sum / arr.length).toFixed(1);
};


function MetricCard({ title, value, subtitle }) {
    return (
        <div className="bg-white p-8 border border-gray-200 rounded-[2rem] shadow-sm transition-all hover:shadow-md">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">{title}</p>
            <p className="text-4xl font-bold text-gray-900 mb-1 tracking-tight">{value}</p>
            <p className="text-xs font-medium text-gray-500">{subtitle}</p>
        </div>
    );
}

export default function ValidationDashboard() {
    const { fetchAllSessions } = useSupabaseLogger();
    const [sessionData, setSessionData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            const data = await fetchAllSessions();
            setSessionData(data);
            setLoading(false);
        };
        loadData();
    }, []);

    if (loading) return <div className="p-20 text-center font-bold">Connecting to Supabase...</div>;
    if (sessionData.length === 0) return <div className="p-20 text-center">No session data found.</div>;


    const avgCompletionTime = calculateAvg(sessionData.map(s => s.duration));
    const totalEvents = sessionData.reduce((acc, s) => acc + (s.confusion_events?.length || 0), 0);

    // Split Conversion Rates
    const sessionsWithHelp = sessionData.filter(s => s.help_shown);
    const sessionsNoHelp = sessionData.filter(s => !s.help_shown);

    const conversionRateWithHelp = sessionsWithHelp.length > 0
        ? ((sessionsWithHelp.filter(s => s.converted).length / sessionsWithHelp.length) * 100).toFixed(0)
        : 0;

    const conversionRateNoHelp = sessionsNoHelp.length > 0
        ? ((sessionsNoHelp.filter(s => s.converted).length / sessionsNoHelp.length) * 100).toFixed(0)
        : 0;


    const allGazePoints = sessionData.flatMap(s => s.gaze_points || []);

    return (
        <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] p-6 md:p-12 font-sans selection:bg-blue-100">
            <div className="max-w-6xl mx-auto">

                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                            Clarity <span className="text-blue-600">Guardian</span> Validation<span className="text-blue-600">Dashboard</span>
                        </h1>
                        <p className="text-sm font-medium text-gray-500 mt-1 text-black">
                            Empirical Eye-Tracking Analytics
                        </p>
                    </div>
                    <div className="flex items-center gap-3 bg-white border border-gray-200 py-2 px-4 rounded-2xl shadow-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                        </span>
                        <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Live Schema Data</span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10 text-black">
                    <MetricCard title="Avg. Time to Pay" value={`${avgCompletionTime}s`} subtitle="Checkout Velocity" />
                    <MetricCard title="Total Confusions" value={totalEvents} subtitle="Detected Friction Points" />
                    <MetricCard title="Conv. Rate (No Help)" value={`${conversionRateNoHelp}%`} subtitle="Organic Success" />
                    <MetricCard title="Conv. Rate (With Help)" value={`${conversionRateWithHelp}%`} subtitle="AI Assisted Success" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    <div className="lg:col-span-2 bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-gray-800">Gaze Intensity Map</h3>
                            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2 py-1 rounded-md uppercase tracking-widest">Aggregated Hotspots</span>
                        </div>

                        <div className="relative border border-gray-100 rounded-2xl overflow-hidden aspect-video bg-gray-50">
                            <div className="absolute inset-0 opacity-20 grayscale pointer-events-none bg-[url('/image.png')] bg-cover bg-center"></div>

                            <div className="relative w-full h-full pointer-events-none">
                                {allGazePoints.map((point, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-12 h-12 bg-blue-500 rounded-full blur-xl opacity-20"
                                        style={{
                                            left: `${point.x}%`,
                                            top: `${point.y}%`,
                                            transform: 'translate(-50%, -50%)'
                                        }}
                                    />
                                ))}
                            </div>

                            <div className="absolute bottom-4 left-4 text-[10px] text-gray-400 font-medium bg-white/80 px-2 py-1 rounded">
                                N = {sessionData.length} User Sessions
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-[2rem] p-8 shadow-sm">
                        <h3 className="font-bold text-lg text-gray-800 mb-6">Confusion Logs</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Price Summary', id: 'price-summary' },
                                { label: 'Terms & Conditions', id: 'terms-cond' },
                                { label: 'Pay Button', id: 'pay-button' },
                            ].map((zone) => {
                                const count = sessionData.reduce((acc, s) =>
                                    acc + (s.confusion_events?.filter(e => e.zoneId === zone.id).length || 0), 0
                                );
                                const percent = Math.min((count / 10) * 100, 100);

                                return (
                                    <div key={zone.id}>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-sm font-semibold text-gray-700">{zone.label}</span>
                                            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{count} triggers</span>
                                        </div>
                                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                                            <div
                                                className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-10 p-5 bg-blue-50 rounded-2xl border border-blue-100">
                            <p className="text-xs font-semibold text-blue-800 leading-relaxed uppercase tracking-tighter mb-1">
                                Data Insight
                            </p>
                            <p className="text-xs text-blue-900 leading-relaxed">
                                Aggregated heatmap shows high dwell density on key friction points.
                            </p>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}