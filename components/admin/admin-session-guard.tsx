"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function AdminSessionGuard() {
  useEffect(() => {
    const supabase = createClient();

    const handlePageHide = () => {
      void supabase.auth.signOut({
        scope: "local",
      });
    };

    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, []);

  return null;
}