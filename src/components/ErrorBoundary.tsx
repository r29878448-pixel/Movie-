import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen bg-[#E8EDF2] p-4 font-sans text-center">
          <div className="p-8 bg-[#E8EDF2] rounded-3xl shadow-[10px_10px_20px_#c5cad0,-10px_-10px_20px_#ffffff] max-w-md w-full">
             <div className="w-16 h-16 mx-auto mb-6 bg-red-100 text-red-500 rounded-full flex items-center justify-center shadow-inner">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
             </div>
             <h1 className="text-xl font-black text-gray-800 mb-2">Something went wrong</h1>
             <p className="text-sm font-medium text-gray-500 mb-6">{this.state.error?.message || 'An unexpected error occurred.'}</p>
             <button 
               onClick={() => window.location.href = '/'}
               className="w-full py-3 bg-[#F2AE01] text-gray-900 font-bold rounded-xl shadow-[4px_4px_10px_rgba(242,174,1,0.4)] transition-transform active:scale-95"
             >
               Go Home
             </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
