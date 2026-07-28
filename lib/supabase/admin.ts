import "server-only";

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { getServerSecrets, getSupabasePublicEnv } from "./env";

export function createAdminClient() {
  const { url } = getSupabasePublicEnv();
  const { serviceRoleKey } = getServerSecrets();
  return createSupabaseClient(url, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
