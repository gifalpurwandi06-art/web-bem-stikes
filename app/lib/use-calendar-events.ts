"use client";

import { useEffect, useState } from "react";
import { getCalendarEventsSnapshot, saveCalendarEvents, type KalenderEvent } from "./calendar-events";
import { getSupabaseBrowserClient } from "./supabase/client";

interface CalendarEventRow {
  id: string;
  event_date: string;
  title: string;
  category: string;
  event_time: string;
  description: string;
}

function fromRow(row: CalendarEventRow): KalenderEvent {
  return {
    id: row.id,
    date: row.event_date,
    title: row.title,
    kategori: row.category,
    waktu: row.event_time,
    deskripsi: row.description,
  };
}

function toRow(event: KalenderEvent): CalendarEventRow {
  return {
    id: event.id,
    event_date: event.date,
    title: event.title,
    category: event.kategori,
    event_time: event.waktu,
    description: event.deskripsi,
  };
}

export function useCalendarEvents() {
  const supabase = getSupabaseBrowserClient();
  const [events, setEvents] = useState<KalenderEvent[]>(() => getCalendarEventsSnapshot());
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    const loadEvents = async () => {
      const { data, error: queryError } = await supabase
        .from("calendar_events")
        .select("id,event_date,title,category,event_time,description")
        .order("event_date", { ascending: true });
      if (!active) return;

      if (queryError) {
        setError("Kalender bersama belum tersedia. Pastikan schema Supabase terbaru sudah dijalankan.");
      } else {
        setEvents((data || []).map((row) => fromRow(row as CalendarEventRow)));
      }
      setLoading(false);
    };

    void loadEvents();
    return () => { active = false; };
  }, [supabase]);

  const saveEvent = async (event: KalenderEvent) => {
    if (!supabase) {
      const nextEvents = [...events.filter((item) => item.id !== event.id), event].sort((first, second) => first.date.localeCompare(second.date));
      saveCalendarEvents(nextEvents);
      setEvents(nextEvents);
      return { error: "" };
    }

    const { data, error: saveError } = await supabase
      .from("calendar_events")
      .upsert(toRow(event), { onConflict: "id" })
      .select("id,event_date,title,category,event_time,description")
      .single();
    if (saveError) return { error: "Agenda gagal disimpan. Pastikan Anda masuk sebagai admin BEM." };

    const savedEvent = fromRow(data as CalendarEventRow);
    setEvents((current) => [...current.filter((item) => item.id !== savedEvent.id), savedEvent].sort((first, second) => first.date.localeCompare(second.date)));
    return { error: "" };
  };

  const deleteEvent = async (id: string) => {
    if (!supabase) {
      const nextEvents = events.filter((event) => event.id !== id);
      saveCalendarEvents(nextEvents);
      setEvents(nextEvents);
      return { error: "" };
    }

    const { error: deleteError } = await supabase.from("calendar_events").delete().eq("id", id);
    if (deleteError) return { error: "Agenda gagal dihapus. Pastikan Anda masuk sebagai admin BEM." };
    setEvents((current) => current.filter((event) => event.id !== id));
    return { error: "" };
  };

  return { events, loading, error, configured: Boolean(supabase), saveEvent, deleteEvent };
}