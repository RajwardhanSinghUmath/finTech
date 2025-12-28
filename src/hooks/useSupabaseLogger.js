'use client';
import { supabase } from '../lib/supabase';

export const useSupabaseLogger = () => {
  const saveSession = async (sessionData) => {
    const { data, error } = await supabase
      .from('eye_tracking_sessions')
      .insert([
        {
          duration: sessionData.duration,
          converted: sessionData.converted,
          confusion_events: sessionData.confusionEvents,
          gaze_points: sessionData.gazePoints,
          help_shown: sessionData.helpShown,
        },
      ]);

    if (error) console.error('Error saving to Supabase:', error);
    return { data, error };
  };

  const fetchAllSessions = async () => {
    const { data, error } = await supabase
      .from('eye_tracking_sessions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) console.error('Error fetching from Supabase:', error);
    return data || [];
  };

  return { saveSession, fetchAllSessions };
};