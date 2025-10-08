import React, { useState } from 'react';
import * as authService from '../services/authService.ts';
import { LogoIcon, Mail, KeyRound, Eye, EyeOff } from '../components/icons.tsx';

interface LoginPageProps {
    onNavigateToRegister: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigateToRegister }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await authService.login(email, password);
            // onLoginSuccess is no longer needed, the Auth component's listener will handle the state change.
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocorreu um erro desconhecido.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <LogoIcon className="w-20 h-20 text-blue-500 mx-auto" />
                    <h1 className="text-5xl font-extrabold text-white mt-4">Foco<span className="text-blue-500">Total</span></h1>
                    <p className="text-gray-400 mt-2">Seu treino com IA. Faça login para continuar.</p>
                </div>

                <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
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
                                    placeholder="********"
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
                                {isLoading ? <div className="w-6 h-6 border-2 border-white border-solid border-t-transparent rounded-full animate-spin"></div> : 'Entrar'}
                            </button>
                        </div>
                    </form>
                    <div className="text-center mt-6">
                        <p className="text-gray-400 text-sm">
                            Não tem uma conta?{' '}
                            <button onClick={onNavigateToRegister} className="font-bold text-blue-400 hover:underline">
                                Crie uma agora
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;