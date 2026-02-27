import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export function usePostings() {
  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchPostings() {
    setIsLoading(true);
    setError(null);

    const { data, error } = await supabase
      .from("postings")
      .select("id, title, category, deadline, apply_url, ig_post_url, clubs(name, logo_url)")
      .order("created_at", { ascending: false });

    if (error) setError(error.message);
    else setData(data ?? []);

    setIsLoading(false);
  }

  useEffect(() => {
    fetchPostings();
  }, []);

  return { data, isLoading, error, refetch: fetchPostings };
}