const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function isSupabaseConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function getSupabasePublicEnv(): { url: string; anonKey: string } {
  const missing: string[] = [];

  if (!supabaseUrl) {
    missing.push("NEXT_PUBLIC_SUPABASE_URL");
  }

  if (!supabaseAnonKey) {
    missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  if (missing.length > 0) {
    throw new Error(
      `Configuração Supabase em falta: ${missing.join(", ")}.`
    );
  }

  return {
    url: supabaseUrl as string,
    anonKey: supabaseAnonKey as string,
  };
}

export function getServerSecrets(): { serviceRoleKey: string; adminEmail: string } {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;

  const missing: string[] = [];

  if (!serviceRoleKey) {
    missing.push("SUPABASE_SERVICE_ROLE_KEY");
  }

  if (!adminEmail) {
    missing.push("ADMIN_EMAIL");
  }

  if (missing.length > 0) {
    throw new Error(
      `Configuração Supabase do servidor em falta: ${missing.join(", ")}.`
    );
  }

  return {
    serviceRoleKey: serviceRoleKey as string,
    adminEmail: adminEmail as string,
  };
}

export function getSupabaseServerEnv() {
  return {
    ...getSupabasePublicEnv(),
    ...getServerSecrets(),
  };
}
