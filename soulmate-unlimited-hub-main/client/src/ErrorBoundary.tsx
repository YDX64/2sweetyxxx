import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/hooks/useLanguage';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-lg w-full">
            <ErrorBoundaryContent error={this.state.error} errorInfo={this.state.errorInfo} />
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Functional component to use hooks
const ErrorBoundaryContent: React.FC<{ error: Error | null; errorInfo: ErrorInfo | null }> = ({ error, errorInfo }) => {
  const { t } = useLanguage();

  return (
    <>
      <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
        {t('errorBoundary.title')}
      </h2>
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
        <p className="text-sm text-red-800 dark:text-red-200 font-mono">
          {error && error.toString()}
        </p>
      </div>
      {import.meta.env.MODE === 'development' && errorInfo && (
        <details className="mb-4">
          <summary className="cursor-pointer text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200">
            {t('errorBoundary.errorDetails')}
          </summary>
          <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded overflow-auto max-h-64">
            {errorInfo.componentStack}
          </pre>
        </details>
      )}
      <div className="flex gap-3">
        <Button
          onClick={() => window.location.reload()}
          className="flex-1"
        >
          {t('errorBoundary.refreshPage')}
        </Button>
        <Button
          onClick={() => window.location.href = '/'}
          variant="outline"
          className="flex-1"
        >
          {t('errorBoundary.goToHomePage')}
        </Button>
      </div>
    </>
  );
};

export default ErrorBoundary;