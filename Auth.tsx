import React, { useState, useEffect, lazy, Suspense } from 'react';
import { User } from './types.ts';
import * as authService from './services/authService.ts';
import LoginPage from './pages/LoginPage.tsx';
import RegisterPage from './pages/RegisterPage.tsx';
import { supabase, isSupabaseConfigured } from './services/supabaseClient.ts';
import Spinner from './components/Spinner.tsx';

const App = lazy(() => import('./App.tsx'));

const ConfigErrorScreen = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 text-center p-4">
        <h1 className="text-2xl font-bold text-red-500">Configuração Incompleta</h1>
        <p className="text-gray-300 mt-4 max-w-lg">
            Por favor, abra o arquivo <code className="bg-gray-700 text-yellow-300 p-1 rounded">services/supabaseClient.ts</code> e substitua os valores de placeholder pelas suas credenciais reais do Supabase para continuar.
        </p>
    </div>
);

const InitErrorScreen = ({ error }: { error: string }) => {
    // A simple parser for styling text based on simple markup.
    const renderErrorText = (line: string) => {
        return line
            .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-yellow-300">$1</strong>')
            .replace(/`([^`]+)`/g, '<code class="bg-gray-700 text-yellow-300 p-1 rounded font-mono text-sm">$1</code>');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 p-4">
            <div className="w-full max-w-2xl bg-gray-800 p-8 rounded-2xl shadow-2xl text-left border border-red-500/50">
                <h1 className="text-2xl font-bold text-red-500 text-center mb-6">Erro de Conexão com a Autenticação</h1>
                
                <div className="text-gray-300 space-y-4 whitespace-pre-wrap leading-relaxed">
                   {error.split('\n\n').map((paragraph, index) => (
                        <div key={index}>
                           {paragraph.split('\n').map((line, lineIndex) => (
                                <p key={lineIndex} className="text-base" dangerouslySetInnerHTML={{ __html: renderErrorText(line) }} />
                           ))}
                        </div>
                   ))}
                </div>
                 <p className="text-gray-400 mt-8 text-center text-sm">Se o problema persistir após seguir os passos, verifique o console do desenvolvedor (F12) para mensagens de erro detalhadas (CORS, Network Error).</p>
            </div>
        </div>
    );
};

const Auth: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [authView, setAuthView] = useState<'login' | 'register'>('login');
    const [initError, setInitError] = useState<string | null>(null);
    const [isConfigured, setIsConfigured] = useState(isSupabaseConfigured);

    useEffect(() => {
        console.log("Auth: Component mounted. Starting initialization.");

        if (!isConfigured) {
            console.error("Auth: Supabase is not configured. Halting app initialization.");
            setLoading(false);
            return;
        }
        console.log("Auth: Supabase configuration check passed.");

        setLoading(true);
        setInitError(null);
        
        const getSessionAndSetUser = async () => {
            console.log("Auth: Attempting to get Supabase session...");
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                
                if (error) {
                    console.error("Auth Error: Could not get session from Supabase.", error);
                    const detailedError = `Ocorreu um erro ao conectar com o serviço de autenticação. Isso é **normal** quando o app é publicado em um novo site.

**Causa:** O Supabase, por segurança, só aceita logins de URLs que você autorizou. A URL do seu site **ainda não foi autorizada**.

**Solução Rápida (Passo a Passo):**

1.  **Copie a URL oficial do seu site abaixo:**
    \`https://focototalllll.netlify.app\`

2.  **Abra as configurações de autenticação do seu projeto Supabase.**
    (Vá para \`app.supabase.com\` -> seu projeto -> \`Authentication\` -> \`URL Configuration\`)

3.  **Cole a URL que você copiou nos seguintes campos:**
    -   \`Site URL\`
    -   \`Additional Redirect URLs\` (Adicione a URL aqui também)

4.  **Salve as alterações no Supabase.**

5.  **Aguarde 2 minutos** e depois recarregue esta página. O login deve funcionar.

---
**Para desenvolvimento local**, você também pode adicionar \`http://localhost:3000\` (ou a porta que você usa) em \`Additional Redirect URLs\`.

**Detalhes técnicos do erro:**
${error.message}`;
                    setInitError(detailedError);
                    return;
                }
                
                console.log("Auth: Supabase session received:", session ? 'Session found' : 'No session');

                const user = session?.user ? {
                    id: session.user.id,
                    email: session.user.email || '',
                    name: session.user.user_metadata.name || ''
                } : null;

                setCurrentUser(user);
                console.log("Auth: Current user state set.", user);

            } catch (e) {
                console.error("Auth: Caught exception during getSessionAndSetUser.", e);
                const errorMessage = e instanceof Error ? e.message : 'Um erro desconhecido ocorreu.';
                setInitError(`Um erro inesperado impediu o aplicativo de iniciar. Por favor, verifique o console do navegador para mais detalhes.\n\n**Detalhes técnicos:**\n${errorMessage}`);
            } finally {
                setLoading(false);
                console.log("Auth: Initial session loading finished.");
            }
        };

        getSessionAndSetUser();
        
        console.log("Auth: Subscribing to Supabase auth state changes.");
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            console.log("Auth: State change detected. Event:", _event);
            const user = session?.user ? {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata.name || ''
            } : null;
            setCurrentUser(user);
            console.log("Auth: User state updated by listener.", user);
        });

        return () => {
            console.log("Auth: Unsubscribing from auth state changes.");
            subscription?.unsubscribe();
        };
    }, [isConfigured]);

    const handleLogout = async () => {
        await authService.logout();
        setCurrentUser(null);
        setAuthView('login');
    };

    if (!isConfigured) {
        return <ConfigErrorScreen />;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900">
                <Spinner />
            </div>
        );
    }
    
    if (initError) {
        return <InitErrorScreen error={initError} />;
    }
    
    if (!currentUser) {
        return authView === 'login' 
            ? <LoginPage onNavigateToRegister={() => setAuthView('register')} />
            : <RegisterPage onNavigateToLogin={() => setAuthView('login')} />;
    }

    return (
      <Suspense fallback={
          <div className="min-h-screen flex items-center justify-center bg-gray-900">
              <Spinner />
          </div>
      }>
        <App onLogout={handleLogout} user={currentUser} />
      </Suspense>
    );
};

export default Auth;
