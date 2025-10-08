import { supabase, isSupabaseConfigured } from './supabaseClient.ts';
import { User } from '../types.ts';
import { BASE_XP_TO_LEVEL_UP } from '../constants.ts';

// Mapeia o objeto de usuário do Supabase para o tipo User do nosso aplicativo.
const mapSupabaseUserToAppUser = (supabaseUser: any): User => {
    return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata.name || '',
    };
};

export const register = async (name: string, email: string, password: string): Promise<User> => {
    if (!isSupabaseConfigured) throw new Error("Supabase não está configurado. Verifique suas variáveis de ambiente.");
    
    // Passo 1: Registrar o usuário. Os metadados são passados aqui para o trigger do banco de dados.
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name: name,
                avatar_url: '👤', // Add a default avatar on signup
            }
        }
    });

    if (signUpError) throw signUpError;
    if (!signUpData.user) throw new Error("Registro bem-sucedido, mas nenhum dado de usuário retornado.");

    // O trigger do banco de dados usará os metadados do signUp para criar o perfil.
    // O campo WhatsApp foi removido do registro inicial para garantir que a criação da conta nunca falhe devido a formatação.
    // O usuário pode adicionar o número na página de perfil.

    return mapSupabaseUserToAppUser(signUpData.user);
};

export const login = async (email: string, password: string): Promise<User> => {
    if (!isSupabaseConfigured) throw new Error("Supabase não está configurado.");
    
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) throw error;
    if (!data.user) throw new Error("Login bem-sucedido, mas nenhum dado de usuário retornado.");
    
    return mapSupabaseUserToAppUser(data.user);
};

export const logout = async (): Promise<void> => {
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
        console.error("Error logging out:", error.message);
    }
};

export const getCurrentUser = async (): Promise<User | null> => {
    if (!isSupabaseConfigured) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return null;
    }
    
    return mapSupabaseUserToAppUser(user);
};