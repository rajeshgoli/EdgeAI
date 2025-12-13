import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children?: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (
                <div className="flex flex-col items-center justify-center h-full w-full bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-center">
                    <h2 className="text-xl font-bold text-red-400 mb-2">Something went wrong.</h2>
                    <p className="text-red-300/80 text-sm font-mono mb-4">
                        {this.state.error?.message || 'Unknown error occurred'}
                    </p>
                    <button
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded transition-colors"
                        onClick={() => this.setState({ hasError: false, error: null })}
                    >
                        Try Again
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
