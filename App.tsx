import React, { useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import { SettingsProvider, useSettings } from './context/SettingsContext.tsx';
import { AppContextProvider } from './context/AppContextProvider.tsx';
import { NavigationProvider, useNavigation } from './context/NavigationContext.tsx';
import { useChat } from './context/ChatContext.tsx';
import Sidebar from './components/Sidebar.tsx';
import LoginScreen from './screens/Auth/LoginScreen.tsx';
import SignUpScreen from './screens/Auth/SignUpScreen.tsx';
import ForgotPasswordScreen from './screens/Auth/ForgotPasswordScreen.tsx';
import type { Screen } from './types.ts';
import { AppLogo } from './components/icons.tsx';
import { useModalState } from './hooks/useModalState.ts';
import MainRouter from './components/MainRouter.tsx';
import { useUser } from './context/UserContext.tsx';
import { useCall } from './context/CallContext.tsx';
import { useSavedMessages } from './context/SavedMessagesContext.tsx';

const GlobalAlert: React.FC<{
    message: string;
    type: 'success' | 'error';
    onDismiss: () => void;
}> = ({ message, type, onDismiss }) => {
    const { theme } = useSettings();
    const isDark = theme === 'dark';
    const isSuccess = type === 'success';

    const alertColors = {
        bg: isSuccess ? 'bg-green-100' : 'bg-red-100',
        border: isSuccess ? 'border-green-400' : 'border-red-400',
        text: isSuccess ? 'text-green-700' : 'text-red-700',
        darkBg: isSuccess ? 'bg-green-900/80' : 'bg-red-900/80',
        darkBorder: isSuccess ? 'border-green-500/50' : 'border-red-500/50',
        darkText: isSuccess ? 'text-green-200' : 'text-red-200',
    };

    const currentColors = isDark ? {
        bg: alertColors.darkBg,
        border: alertColors.darkBorder,
        text: alertColors.darkText,
    } : {
        bg: alertColors.bg,
        border: alertColors.border,
        text: alertColors.text,
    };

    useEffect(() => {
        const timer = setTimeout(onDismiss, 5000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return (
        <div 
            className={`fixed top-4 left-1/2 -translate-x-1/2 w-11/12 max-w-md p-4 rounded-lg shadow-lg z-50 border-l-4 ${currentColors.bg} ${currentColors.border} backdrop-blur-sm`}
            role="alert"
        >
            <div className="flex">
                <div className="ml-3">
                    <p className={`font-bold ${currentColors.text}`}>{isSuccess ? 'Berhasil' : 'Error'}</p>
                    <p className={`text-sm ${currentColors.text}`}>{message}</p>
                </div>
                <button onClick={onDismiss} className="ml-auto -mx-1.5 -my-1.5 p-1.5 rounded-lg focus:ring-2 inline-flex h-8 w-8" aria-label="Dismiss">
                    <span className="sr-only">Dismiss</span>
                    <svg className={`w-5 h-5 ${currentColors.text}`} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                </button>
            </div>
        </div>
    );
};

const GenericErrorScreen: React.FC<{
    message: string;
    onAction: () => void;
    actionText: string;
}> = ({ message, onAction, actionText }) => {
    const { theme } = useSettings();
    const isDark = theme === 'dark';
    const colors = {
        bg: isDark ? 'bg-[#18222d]' : 'bg-gray-100',
        secondaryText: isDark ? 'text-gray-300' : 'text-gray-600',
        buttonBg: 'bg-red-500 hover:bg-red-600',
        buttonText: 'text-white'
    };
    return (
        <div className={`h-full w-full flex flex-col items-center justify-center ${colors.bg} p-4 text-center`}>
            <h2 className="text-2xl font-bold text-red-500 mb-4">Terjadi Kesalahan Kritis</h2>
            <p className={`max-w-md mb-8 ${colors.secondaryText} whitespace-pre-wrap`}>{message}</p>
            <button
              onClick={onAction}
              className={`px-6 py-2 rounded-lg font-semibold ${colors.buttonBg} ${colors.buttonText}`}
            >
              {actionText}
            </button>
        </div>
    );
};

const AppContainer: React.FC = () => {
    const { session, loading, alert, setAlert, userProfile, logout, databaseError } = useAuth();

    if (loading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-[#18222d] text-white">
                <AppLogo className="h-24 w-auto animate-pulse" />
                <p className="mt-4 text-lg">cONnected+</p>
            </div>
        );
    }

    if (databaseError) {
        const error = typeof databaseError === 'object' ? databaseError : { message: "Koneksi ke database gagal." };
        const errorMessage = error.message || "Koneksi ke database gagal. Silakan coba lagi.";
        return <GenericErrorScreen message={errorMessage} onAction={logout} actionText="Keluar" />;
    }

    if (!session || !userProfile) {
        return (
            <NavigationProvider>
                <AuthScreens />
            </NavigationProvider>
        );
    }
    
    return (
        <AppContextProvider>
            <MainApp />
        </AppContextProvider>
    );
};

const AuthScreens: React.FC = () => {
    const { login, signUp, resetPassword, alert, setAlert } = useAuth();
    const { handleNavigate: setAuthScreen } = useNavigation();
    
    const [localScreen, setLocalScreen] = React.useState<Screen>('login');

    const handleLogin = async (email: string, pass: string) => {
        const { error } = await login(email, pass);
        if (error) setAlert({ message: error.message, type: 'error' });
    };

    const handleSignUp = async (firstName: string, lastName: string, email: string, phone: string, pass: string) => {
        const { error } = await signUp({firstName, lastName, email, phone, password: pass});
        if (error) {
            setAlert({ message: error.message, type: 'error' });
        } else {
            setAlert({ message: 'Pendaftaran berhasil! Silakan periksa email Anda untuk verifikasi.', type: 'success' });
            setLocalScreen('login');
        }
    };
    
    const handleResetPassword = async (email: string) => {
        const { error } = await resetPassword(email);
        if (error) {
            setAlert({ message: error.message, type: 'error' });
        } else {
            setAlert({ message: `Jika akun ada, email pemulihan telah dikirim ke ${email}`, type: 'success' });
        }
    }
    
    switch (localScreen) {
        case 'signup':
            return <SignUpScreen onSignUp={handleSignUp} onNavigate={setLocalScreen} />;
        case 'forgotPassword':
            return <ForgotPasswordScreen onReset={handleResetPassword} onNavigate={setLocalScreen} />;
        default:
            return <LoginScreen onLogin={handleLogin} onNavigate={setLocalScreen} alert={alert} setAlert={setAlert} />;
    }
};

const MainContent: React.FC = () => {
    return <MainRouter />;
};

const MainApp: React.FC = () => {
    const { userProfile, logout: authLogout, alert, setAlert } = useAuth();
    const { theme } = useSettings();
    const { loading: chatLoading, dataLoadingError: chatError } = useChat();
    const { loading: userLoading, error: userError } = useUser();
    const { loading: callLoading, error: callError } = useCall();
    const { loading: savedMessagesLoading, error: savedMessagesError } = useSavedMessages();
    const { isSidebarOpen, closeSidebar } = useNavigation();
    
    const logoutConfirmDialog = useModalState();

    const handleLogout = useCallback(async () => {
        logoutConfirmDialog.close();
        authLogout();
    }, [authLogout, logoutConfirmDialog]);
    
    const anyLoading = chatLoading || userLoading || callLoading || savedMessagesLoading;

    if (anyLoading) {
        return (
            <div className="h-full w-full flex flex-col items-center justify-center bg-[#18222d] text-white">
                <AppLogo className="h-24 w-auto animate-pulse" />
                <p className="mt-4 text-lg">Memuat data...</p>
            </div>
        );
    }
    
    const initialLoadError = chatError || userError || callError || savedMessagesError;
    if (initialLoadError) {
        let specificMessage = "Gagal memuat data aplikasi. Ini kemungkinan besar masalah konfigurasi RLS (Keamanan Tingkat Baris) pada database Anda.";
        if (chatError) specificMessage = "Gagal memuat data obrolan. Ini kemungkinan besar masalah rekursi RLS di database. Jalankan skrip SQL perbaikan.";
        else if (userError) specificMessage = "Gagal memuat daftar pengguna. Periksa kebijakan RLS pada tabel 'profiles'.";
        else if (callError) specificMessage = "Gagal memuat riwayat panggilan. Periksa kebijakan RLS pada tabel 'calls'.";
        else if (savedMessagesError) specificMessage = "Gagal memuat pesan tersimpan. Periksa kebijakan RLS pada tabel 'saved_messages'.";
        
        const errorDetails = (initialLoadError instanceof Error) ? initialLoadError.message : "Terjadi kesalahan yang tidak diketahui.";
        const fullMessage = `${specificMessage}\n\nDetail Teknis: ${errorDetails}`;
        
        return <GenericErrorScreen message={fullMessage} onAction={handleLogout} actionText="Keluar" />;
    }
    
    if (!userProfile) return null;

    const isDark = theme === 'dark';
    const dialogColors = {
        dialogBg: isDark ? 'bg-[#2a3744]' : 'bg-white',
        primaryText: isDark ? 'text-white' : 'text-black',
        dialogText: isDark ? 'text-gray-300' : 'text-gray-600',
        actionButtonText: isDark ? 'text-blue-400' : 'text-[#527da3]',
    };
    
    return (
        <div className={`h-full w-full flex ${theme === 'dark' ? 'dark' : ''}`}>
             {alert && <GlobalAlert message={alert.message} type={alert.type} onDismiss={() => setAlert(null)} />}
             
             {logoutConfirmDialog.isOpen && (
                <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="logout-dialog-title">
                  <div className={`${dialogColors.dialogBg} rounded-lg p-6 w-4/5 max-w-sm text-left`}>
                    <h2 id="logout-dialog-title" className={`text-lg font-bold mb-2 ${dialogColors.primaryText}`}>Keluar</h2>
                    <p className={`${dialogColors.dialogText} mb-6`}>Anda yakin ingin keluar dari cONnected+?</p>
                    <div className="flex justify-end space-x-6">
                      <button onClick={logoutConfirmDialog.close} className={`font-semibold ${dialogColors.actionButtonText}`}>BATAL</button>
                      <button onClick={handleLogout} className={`font-semibold text-red-500`}>KELUAR</button>
                    </div>
                  </div>
                </div>
            )}

            <div className="md:flex md:flex-shrink-0">
                <Sidebar 
                    isOpen={isSidebarOpen} 
                    onClose={closeSidebar}
                    phoneNumber={userProfile.phone || ''}
                    fullName={userProfile.name}
                    avatar={userProfile.avatar}
                    onLogout={logoutConfirmDialog.open}
                />
            </div>
            <main className="flex-1 min-w-0">
                 <MainContent />
            </main>
        </div>
    );
};

const AuthOrApp: React.FC = () => {
    const { session, userProfile } = useAuth();
    if (session && userProfile) {
        return (
            <AppContextProvider>
                <MainApp />
            </AppContextProvider>
        );
    }
    return (
        <NavigationProvider>
             <AuthScreens />
        </NavigationProvider>
    );
}


const App: React.FC = () => {
  return (
    <AuthProvider>
        <SettingsProvider>
            <AppContainer />
        </SettingsProvider>
    </AuthProvider>
  );
};

export default App;