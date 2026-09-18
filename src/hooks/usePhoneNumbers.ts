import { useEffect, useState } from "react";
import { supabase } from "@/supabaseClient";
import type { PhoneNumber } from "@/types";

export function usePhoneNumbers() {
  const [numbers, setNumbers] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchNumbers() {
      const { data, error } = await supabase
        .from("phone_numbers")
        .select("*")
        .eq("is_active", true)
        .order("last_sms_at", { ascending: false, nullsFirst: false });

      if (error) {
        setError(error.message);
      } else {
        setNumbers(data || []);
      }
      setLoading(false);
    }
    fetchNumbers();
  }, []);

  return { numbers, loading, error };
}
