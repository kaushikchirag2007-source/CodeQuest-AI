import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const configured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = configured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true
      }
    })
  : null;

function getRedirectUrl() {
  if (import.meta.env.VITE_SUPABASE_REDIRECT_URL) {
    return import.meta.env.VITE_SUPABASE_REDIRECT_URL;
  }

  if (typeof window === 'undefined') {
    return undefined;
  }

  const url = new URL(window.location.href);
  url.search = '';
  url.hash = '';
  return url.toString();
}

function requireClient() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment.'
    );
  }

  return supabase;
}

export function isSupabaseConfigured() {
  return configured;
}

export async function getCurrentUser() {
  const client = requireClient();
  const {
    data: { session },
    error
  } = await client.auth.getSession();

  if (error) {
    throw error;
  }

  return session?.user ?? null;
}

export function subscribeToAuthChanges(onChange) {
  const client = requireClient();
  const {
    data: { subscription }
  } = client.auth.onAuthStateChange((_event, session) => {
    onChange(session?.user ?? null);
  });

  return subscription;
}

export async function signUpWithEmail({ email, password, displayName }) {
  const client = requireClient();
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: getRedirectUrl(),
      data: displayName
        ? {
            display_name: displayName,
            full_name: displayName
          }
        : undefined
    }
  });

  if (error) {
    throw error;
  }

  return {
    user: data.user,
    session: data.session,
    needsEmailConfirmation: !data.session
  };
}

export async function signInWithEmail({ email, password }) {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signInWithGoogle() {
  const client = requireClient();
  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getRedirectUrl(),
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account'
      }
    }
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOut() {
  const client = requireClient();
  const { error } = await client.auth.signOut();

  if (error) {
    throw error;
  }
}

export async function getProfile(userId) {
  const client = requireClient();
  const { data, error } = await client
    .from('profiles')
    .select('profile')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.profile ?? null;
}

export async function saveProfile(userId, profile) {
  const client = requireClient();
  const { error } = await client.from('profiles').upsert(
    {
      id: userId,
      profile,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'id' }
  );

  if (error) {
    throw error;
  }
}

export async function getLearningWorkspace(userId) {
  const client = requireClient();
  const { data, error } = await client
    .from('learning_workspaces')
    .select('workspace')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.workspace ?? null;
}

export async function saveLearningWorkspace(userId, workspace) {
  const client = requireClient();
  const { error } = await client.from('learning_workspaces').upsert(
    {
      user_id: userId,
      workspace,
      updated_at: new Date().toISOString()
    },
    { onConflict: 'user_id' }
  );

  if (error) {
    throw error;
  }
}
