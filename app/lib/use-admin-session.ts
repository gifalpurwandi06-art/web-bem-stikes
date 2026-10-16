"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "./supabase/client";

export function useAdminSession() {
  const supabase = getSupabaseBrowserClient();
  const [isAdmin, setIsAdmin] = useState(false);
  const [accessToken, setAccessToken] = useState("");
  const [loading, setLoading] = useState(Boolean(supabase));
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) return;
    let active = true;

    const restoreSession = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      if (session) await verifyAdminSession(session);
      if (active) setLoading(false);
    };

    const verifyAdminSession = async (session: Session) => {
      const { data, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (!active) return;
      setAccessToken(session.access_token);
      setIsAdmin(!profileError && data?.role === "admin");
      if (profileError) setError("Tidak dapat memeriksa akses admin.");
    };

    void restoreSession();
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      queueMicrotask(() => {
        if (!active) return;
        if (session) {
          void verifyAdminSession(session);
        } else {
          setIsAdmin(false);
          setAccessToken("");
        }
      });
    });

    return () => {
      active = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      setError("Supabase belum dikonfigurasi. Tambahkan URL dan anon key pada environment.");
      return false;
    }

    setLoading(true);
    setError("");
    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError || !data.session) {
      setError(signInError?.message || "Login gagal.");
      setLoading(false);
      return false;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profileError || profile?.role !== "admin") {
      await supabase.auth.signOut();
      setError("Akun ini tidak memiliki akses admin.");
      setIsAdmin(false);
      setAccessToken("");
      setLoading(false);
      return false;
    }

    setAccessToken(data.session.access_token);
    setIsAdmin(true);
    setLoading(false);
    return true;
  };

  const signOut = async () => {
    if (supabase) await supabase.auth.signOut();
    setIsAdmin(false);
    setAccessToken("");
  };

  return { supabase, configured: Boolean(supabase), isAdmin, accessToken, loading, error, signIn, signOut, setError };
}