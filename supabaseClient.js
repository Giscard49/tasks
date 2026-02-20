import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://wagwblkjekxzlpitoqcr.supabase.co' 
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndhZ3dibGtqZWt4emxwaXRvcWNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE1NTE4MjksImV4cCI6MjA4NzEyNzgyOX0.HqnxqiSNpWnDcLTL_LM5onb5Ol_OW0hxwzaYXmThIQU'      

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)