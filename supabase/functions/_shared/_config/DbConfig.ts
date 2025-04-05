import { createClient } from '@supabase'
 
// const SUPABASE_URL =Deno.env.get("SUPABASE_URL")||'';
// const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")||'';
const SUPABASE_URL = "https://pcsuhbghynmeubhzmhad.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBjc3VoYmdoeW5tZXViaHptaGFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzkzNDE1NDQsImV4cCI6MjA1NDkxNzU0NH0.4LXEjEkLxTeG1-BHsTBH6POBntRKFS4ej78CgJiQh2Y";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
console.log(SUPABASE_URL)
 
export default supabase;