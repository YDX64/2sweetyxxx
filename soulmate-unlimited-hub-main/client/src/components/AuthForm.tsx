import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { Heart, Mail, Apple } from 'lucide-react';
import { toast } from 'sonner';

// Modern Context7 pattern: Type-safe error handling for authentication
interface AuthError {
  message: string;
  code?: string;
  statusCode?: number;
}

// Modern utility: Type-safe error message extraction
const getErrorMessage = (error: unknown, fallback: string): string => {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as AuthError).message);
  }
  return fallback;
};

interface AuthFormProps {
  defaultMode?: 'login' | 'signup';
}

export const AuthForm = ({ defaultMode = 'login' }: AuthFormProps = {}) => {
  const { t } = useLanguage();
  const { signUp, signIn, signInWithGoogle, signInWithApple, signInWithFacebook } = useAuth();
  const [isLogin, setIsLogin] = useState(defaultMode === 'login');
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  // Listen for auth mode change events
  useEffect(() => {
    const handleAuthModeChange = (event: CustomEvent) => {
      if (event.detail?.mode === 'signup') {
        setIsLogin(false);
      } else if (event.detail?.mode === 'login') {
        setIsLogin(true);
      }
    };

    window.addEventListener('authModeChange', handleAuthModeChange as EventListener);
    
    return () => {
      window.removeEventListener('authModeChange', handleAuthModeChange as EventListener);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        await signIn(formData.email, formData.password);
        toast.success(t('loginSuccess'));
      } else {
        await signUp(formData.email, formData.password, formData.name);
        toast.success(t('accountCreated'));
      }
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('errorOccurred'));
      toast.error(errorMessage);
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithGoogle();
    } catch (error: unknown) {
      toast.error(t('googleSignInError'));
      console.error('Google auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setLoading(true);
      await signInWithApple();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('appleSignInError'));
      toast.error(errorMessage);
      console.error('Apple auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      setLoading(true);
      await signInWithFacebook();
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t('facebookSignInError'));
      toast.error(errorMessage);
      console.error('Facebook auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      <Header />
      <div className="flex items-center justify-center p-4 pt-8 flex-1">
        <Card className="w-full max-w-md bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-2xl border-0">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-white" />
              </div>
            </div>
            <CardTitle className="text-3xl font-bold">
              <span className="bg-gradient-to-r from-pink-500 to-red-500 bg-clip-text text-transparent">
                {isLogin ? t('welcomeBack') : t('joinNow')}
              </span>
            </CardTitle>
            <p className="text-gray-600 dark:text-gray-300 mt-2">
              {isLogin ? t('loginSubtitle') : t('signUpSubtitle')}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Social Login Buttons */}
            <div className="space-y-3">
              {/* Google Sign In */}
              <Button
                onClick={handleGoogleSignIn}
                variant="outline"
                className="w-full h-12 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-800"
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path fill="#4285f4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34a853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#fbbc05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#ea4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                {t('continueWithGoogle')}
              </Button>

              {/* Apple Sign In */}
              <Button
                onClick={handleAppleSignIn}
                variant="outline"
                className="w-full h-12 bg-gray-900 hover:bg-gray-800 text-white border-gray-900 dark:bg-white dark:hover:bg-gray-100 dark:text-black dark:border-white"
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/>
                </svg>
                {t('continueWithApple')}
              </Button>

              {/* Facebook Sign In */}
              <Button
                onClick={handleFacebookSignIn}
                variant="outline"
                className="w-full h-12 text-white bg-[#1877F2] hover:bg-[#166FE5] border-[#1877F2]"
                disabled={loading}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                {t('continueWithFacebook')}
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-gray-300 dark:border-gray-600" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-gray-900 px-2 text-gray-500 dark:text-gray-400">{t('orContinueWithEmail')}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-200 font-medium">{t('name')}</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder={t('enterName')}
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 h-12 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    required={!isLogin}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email" className="text-gray-700 dark:text-gray-200 font-medium">{t('email')}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t('emailPlaceholder')}
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="mt-1 h-12 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-700 dark:text-gray-200 font-medium">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder={t('passwordPlaceholder')}
                  value={formData.password}
                  onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                  className="mt-1 h-12 dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 bg-gradient-to-r from-pink-500 to-red-500 hover:from-pink-600 hover:to-red-600 text-white font-semibold rounded-lg shadow-lg"
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                ) : (
                  <Mail className="w-5 h-5 mr-2" />
                )}
                {loading ? t('loading') : (isLogin ? t('signIn') : t('createAccount'))}
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="text-gray-600 dark:text-gray-300 hover:text-pink-500 dark:hover:text-pink-400 underline underline-offset-4 transition-colors duration-200 font-medium"
              >
                {isLogin ? t('noAccountSignUp') : t('hasAccountSignIn')}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};
