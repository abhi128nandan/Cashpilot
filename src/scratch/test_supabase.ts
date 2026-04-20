import { createClient } from '../lib/supabase/server'

async function testSupabase() {
  console.log('🧪 Testing Supabase connection...')
  
  try {
    const supabase = await createClient()
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
    
    if (error) {
      console.error('❌ Error fetching profiles:', error.message)
      if (error.message.includes('relation "profiles" does not exist')) {
        console.log('💡 Tip: You likely need to create the "profiles" table in your Supabase dashboard.')
      }
      return
    }
    
    console.log('✅ Success! Found profiles:', data)
  } catch (err) {
    console.error('💥 Unexpected error:', err)
  }
}

testSupabase()
