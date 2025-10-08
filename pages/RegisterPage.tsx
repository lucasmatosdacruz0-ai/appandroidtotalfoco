import React, { useState } from 'react';
import * as authService from '../services/authService.ts';
import { LogoIcon, Mail, KeyRound, UserIcon, Eye, EyeOff } from '../components/icons.tsx';

interface RegisterPageProps {
    onNavigateToLogin: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        if (password.length < 6) {
            setError("A senha deve ter pelo menos 6 caracteres.");
            setIsLoading(false);
            return;
        }

        try {
            await authService.register(name, email, password);
            setIsSuccess(true); // Mostra a tela de sucesso
        } catch (err) {
            console.error("Erro de Registro:", err); // Log the full error for debugging
            if (err instanceof Error) {
                 if (err.message.includes('User already registered')) {
                    setError('Este e-mail já está cadastrado. Tente fazer login.');
                } else if (err.message.includes('invalid format')) {
                    setError('Por favor, insira um e-mail válido.');
                } else if (err.message.toLowerCase().includes('signups not allowed')) {
                    setError('O cadastro de novos usuários está desativado. Por favor, habilite-o nas configurações de Autenticação do seu projeto Supabase.');
                } else if (err.message.toLowerCase().includes('database error saving new user') || err.message.toLowerCase().includes('constraint violation')) {
                    setError('Erro Crítico de Configuração do Backend (Supabase): O registro falhou porque o banco de dados não criou o perfil do usuário. Isso é causado por um "trigger" de banco de dados ausente ou por políticas de segurança (RLS) incorretas. Execute o script SQL de configuração no seu painel Supabase para corrigir.');
                }
                else {
                    setError(`Ocorreu um erro: ${err.message}. Verifique o console e a configuração do Supabase.`);
                }
            } else {
                setError("Ocorreu um erro desconhecido.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
             <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4 animate-fade-in">
                <div className="w-full max-w-md">
                    <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl text-center">
                        <Mail className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-white">Confirme seu E-mail</h2>
                        <p className="text-gray-400 mt-4">
                            Enviamos um link de confirmação para <strong className="text-white">{email}</strong>. Por favor, verifique sua caixa de entrada (e a pasta de spam) para ativar sua conta.
                        </p>
                        <button 
                            onClick={onNavigateToLogin} 
                            className="mt-8 w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 transition-colors duration-300"
                        >
                            Voltar para o Login
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <LogoIcon className="w-20 h-20 text-blue-500 mx-auto" />
                    <h1 className="text-5xl font-extrabold text-white mt-4">Foco<span className="text-blue-500">Total</span></h1>
                    <p className="text-gray-400 mt-2">Crie sua conta para começar sua jornada.</p>
                </div>

                <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-300 mb-2">Nome</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full bg-gray-900 text-white p-3 pl-10 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="Seu nome"
                                />
                            </div>
                        </div>
                         <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-300 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-gray-900 text-white p-3 pl-10 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>
                        <div>
                            <label htmlFor="password"  className="block text-sm font-bold text-gray-300 mb-2">Senha</label>
                            <div className="relative">
                                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    id="password"
                                    type={isPasswordVisible ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-gray-900 text-white p-3 pl-10 pr-10 rounded-lg border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                                    placeholder="Mínimo 6 caracteres"
                                />
                                <button
                                    type="button"
                                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
                                    aria-label={isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'}
                                >
                                    {isPasswordVisible ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>
                        
                        {error && <p className="text-red-400 text-sm text-center">{error}</p>}

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 text-white font-bold p-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 disabled:bg-blue-800 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? <div className="w-6 h-6 border-2 border-white border-solid border-t-transparent rounded-full animate-spin"></div> : 'Criar Conta'}
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-6">
                        <p className="text-gray-400 text-sm">
                            Já tem uma conta?{' '}
                            <button onClick={onNavigateToLogin} className="font-bold text-blue-400 hover:underline">
                                Faça login
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;