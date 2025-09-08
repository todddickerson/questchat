import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Helper function to check Supabase connection
export async function testSupabaseConnection() {
  try {
    const { data, error } = await supabase.from('User').select('count', { count: 'exact', head: true })
    if (error) {
      console.warn('Supabase connection test failed:', error.message)
      return false
    }
    console.log('Supabase connection successful')
    return true
  } catch (error) {
    console.warn('Supabase connection error:', error)
    return false
  }
}
