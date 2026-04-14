import { supabase } from './supabase';

export interface TravelUser {
  id: number;
  name: string;
  role: string;
  points?: number; // Calculated on frontend
}

export interface TravelTrip {
  id: number;
  start_date: string;
  end_date: string;
  leader_id: number;
  assistant_id: number;
  status: string;
  original_leader_id: number | null;
  original_assistant_id: number | null;
  created_at?: string;
}

export const fetchTravelUsers = async (): Promise<TravelUser[]> => {
  const { data, error } = await supabase
    .from('travel_users')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const fetchTravelTrips = async (): Promise<TravelTrip[]> => {
  const { data, error } = await supabase
    .from('travel_trips')
    .select('*')
    .order('id', { ascending: true });
  if (error) throw error;
  return data || [];
};

export const createTravelTrip = async (trip: Omit<TravelTrip, 'id' | 'created_at'>): Promise<TravelTrip> => {
  const { data, error } = await supabase
    .from('travel_trips')
    .insert(trip)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const updateTravelTrip = async (id: number, updates: Partial<TravelTrip>): Promise<TravelTrip> => {
  const { data, error } = await supabase
    .from('travel_trips')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
};

export const deleteTravelTrip = async (id: number): Promise<void> => {
  const { error } = await supabase
    .from('travel_trips')
    .delete()
    .eq('id', id);
  if (error) throw error;
};
