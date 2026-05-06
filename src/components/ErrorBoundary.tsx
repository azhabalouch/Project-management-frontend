import { Component, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className='flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--bg-main)] px-8 text-center text-[var(--text-primary)]'>
          <h1 className='text-2xl font-semibold tracking-[-0.3px] text-[var(--text-primary)]'>
            Something went wrong
          </h1>
          <p className='max-w-md text-[var(--text-secondary)]'>
            An unexpected error occurred. Please try refreshing the page.
          </p>
          {this.state.error && (
            <pre className='max-w-3xl overflow-auto rounded-md border border-[var(--border-color)] bg-[var(--bg-surface)] px-4 py-3 text-left text-sm text-[var(--status-error-text)]'>
              {this.state.error.message}
            </pre>
          )}
          <div className='flex flex-wrap gap-3'>
            <button className='btn-primary' onClick={this.handleReset}>
              Try Again
            </button>
            <button className='btn-secondary' onClick={() => window.location.reload()}>
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
