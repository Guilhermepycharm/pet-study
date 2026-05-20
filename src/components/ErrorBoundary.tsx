import { Component, type ReactNode } from 'react';
import { AlertTriangle, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackLabel?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string | null }): void {
    console.error('[ErrorBoundary] Caught error:', error);
    console.error('[ErrorBoundary] Component stack:', errorInfo.componentStack);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  handleClearAndReset = (): void => {
    try {
      localStorage.removeItem('catstudy-schedule');
      localStorage.removeItem('catstudy-pet');
      localStorage.removeItem('catstudy-missions');
      localStorage.removeItem('catstudy-flashcards');
      localStorage.removeItem('catstudy-xp');
      localStorage.removeItem('catstudy-settings');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-accent-red/10 flex items-center justify-center mb-4">
            <AlertTriangle className="w-8 h-8 text-accent-red" />
          </div>
          <h3 className="text-lg font-bold text-text-primary mb-2">
            {this.props.fallbackLabel || 'Algo deu errado'}
          </h3>
          <p className="text-sm text-text-secondary max-w-sm mb-1">
            Ocorreu um erro inesperado nesta seção.
          </p>
          {this.state.error && (
            <p className="text-xs text-text-tertiary max-w-sm mb-6 font-mono bg-card-bg/50 rounded-lg p-2">
              {this.state.error.message}
            </p>
          )}
          <div className="flex gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-accent-red text-white text-sm font-medium hover:bg-accent-red/90 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Tentar novamente
            </button>
            <button
              onClick={this.handleClearAndReset}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-text-secondary text-sm font-medium hover:bg-card-bg transition-colors"
            >
              <Home className="w-4 h-4" />
              Resetar dados
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
