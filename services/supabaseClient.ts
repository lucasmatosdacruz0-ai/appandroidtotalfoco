import { createClient } from '@supabase/supabase-js';

// --- INSTRUÇÕES IMPORTANTES ---
// Suas credenciais do Supabase estão abaixo. Elas conectam o app ao seu banco de dados.
// **NÃO** altere estes valores a menos que você mude de projeto Supabase.
const supabaseUrl: string = 'https://uovgyrjdbbodkjymjwxz.supabase.co'; // Ex: 'https://seuid.supabase.co'
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVvdmd5cmpkYmJvZGtqeW1qd3h6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMyNjU2NDUsImV4cCI6MjA1ODg0MTY0NX0.4kOmrvn3Wleec_XjpLclUalM94IWSaV2Roi6MIIZWJk'; // Ex: 'eyJhbGci...'

// --- CONFIGURAÇÃO DE PRODUÇÃO ---
// Para que o login funcione no seu site oficial (https://focototalllll.netlify.app),
// você DEVE adicionar essa URL nas configurações de autenticação do seu projeto Supabase.
// Vá para o seu projeto em supabase.com, depois: Authentication -> URL Configuration -> Site URL.

// O código original que lia as variáveis de ambiente foi comentado abaixo.
// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

// --- Verificação de Segurança ---
// A lógica foi movida para o componente Auth.tsx para evitar a manipulação direta do DOM,
// que estava causando conflitos com o React.
// A verificação foi corrigida para usar placeholders genéricos que não conflitam com as chaves reais.
const areCredentialsPlaceholders = 
    !supabaseUrl || supabaseUrl === 'COLE_SUA_URL_AQUI' || 
    !supabaseAnonKey || supabaseAnonKey === 'COLE_SUA_CHAVE_ANON_AQUI';

// Exporta o cliente Supabase e um booleano para indicar se está configurado.
export const supabase = areCredentialsPlaceholders ? {} as any : createClient(supabaseUrl, supabaseAnonKey);
export const isSupabaseConfigured = !areCredentialsPlaceholders;