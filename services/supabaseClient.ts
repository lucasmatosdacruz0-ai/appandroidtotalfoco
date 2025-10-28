import { createClient } from '@supabase/supabase-js';

// ---- COLE SUAS CREDENCIAIS DO SUPABASE AQUI ----
// Você pode encontrar esses valores em:
// Configurações do Projeto > API
const supabaseUrl = "https://zwsvxifklprysctewwmd.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp3c3Z4aWZrbHByeXNjdGV3d21kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyOTU0MTYsImV4cCI6MjA3Mzg3MTQxNn0.OlxR6oXcuml0BybNlmox_hvVH934lAiIXzFRg3KHEuM";
// ----------------------------------------------------

// A verificação se as credenciais foram preenchidas foi removida.
// O aplicativo agora assume que as credenciais corretas estão sempre presentes.
// Se não estiverem, o createClient falhará, e o erro será visível no console.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
