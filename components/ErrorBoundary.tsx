'use client';

import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{}>,
  ErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary-purple to-primary-pink">
          <div className="text-center max-w-md">
            <div className="w-24 h-24 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-12 h-12 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">哎呀，出了点小问题</h2>
            <p className="text-gray-600 mb-6">
              应用遇到了意外错误，请刷新页面重试
            </p>
            <button
              onClick={() => window.location.reload()}
              className="flex items-center justify-center mx-auto px-6 py-3 bg-gradient-to-r from-accent-purple to-accent-pink text-white rounded-xl font-bold hover:shadow-lg transition-all duration-200"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}