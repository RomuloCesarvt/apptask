import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase environment variables are missing.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getOAuthProviders() {
  try {
    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        apikey: supabaseAnonKey!,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
    })
    if (!response.ok) return { google: false, azure: false }
    const settings = await response.json() as { external?: Record<string, boolean> }
    return {
      google: settings.external?.google === true,
      azure: settings.external?.azure === true,
    }
  } catch {
    return { google: false, azure: false }
  }
}

export function getAuthRedirectUrl() {
  if (typeof window === 'undefined') {
    return undefined
  }

  return `${window.location.origin}/auth/callback`
}
