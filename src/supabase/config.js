import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://offzvrdbvdncnnzjxwah.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9mZnp2cmRidmRuY25uemp4d2FoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU2ODg5OTIsImV4cCI6MjA4MTI2NDk5Mn0.QCxO_R1So-AEJ7LEY0gUAApMc1i_z_Yz6afdPKXJbYg'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
