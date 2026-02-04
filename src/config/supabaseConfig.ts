/**
 * Supabase Configuration
 *
 * This file contains the Supabase client initialization and type definitions.
 * The client is used to interact with the Supabase database and authentication.
 *
 * Project: Pfluger_Prism
 * Database: PostgreSQL via Supabase
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './supabase.types'

// Get Supabase credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate required environment variables
if (!supabaseUrl) {
  throw new Error(
    'Missing VITE_SUPABASE_URL environment variable. ' +
    'Please add it to your .env.local file.'
  )
}

if (!supabaseAnonKey) {
  throw new Error(
    'Missing VITE_SUPABASE_ANON_KEY environment variable. ' +
    'Please add it to your .env.local file.'
  )
}

// Create Supabase client with TypeScript types
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage, // Use localStorage for session persistence
    storageKey: 'prism-auth-token', // Custom storage key
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'project-prism@1.0.0'
    }
  }
})

/**
 * Helper function to check if user is authenticated
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

/**
 * Helper function to get current user
 */
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

/**
 * Helper function to sign out
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

/**
 * Database table names for type safety
 */
export const TABLES = {
  FACILITIES: 'facilities',
  PROJECTS: 'projects',
  BONDS: 'bonds',
  BOND_PROJECTS: 'bond_projects',
  PROJECT_ELEMENTAL_COSTS: 'project_elemental_costs',
  COST_RATES: 'cost_rates',
  ELEMENTAL_CODES: 'elemental_codes',
  PODS: 'pods',
  POD_SPACES: 'pod_spaces',
  SPACE_TYPES: 'space_types',
  PROFILES: 'profiles', // User profiles linked to auth.users
} as const

/**
 * Export Database type for use in other files
 */
export type { Database }
