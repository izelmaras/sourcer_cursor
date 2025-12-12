import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
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
      return (
        <div style={{
          padding: '40px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          maxWidth: '600px',
          margin: '50px auto',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ color: '#ef4444', marginBottom: '20px' }}>Application Error</h1>
          <p style={{ marginBottom: '16px', color: '#374151' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          {this.state.error?.message?.includes('VITE_SUPABASE') && (
            <div style={{ 
              background: '#fef3c7', 
              padding: '16px', 
              borderRadius: '6px', 
              marginTop: '20px',
              border: '1px solid #fbbf24'
            }}>
              <p style={{ margin: '0 0 12px 0', fontWeight: '600', color: '#92400e' }}>
                Missing Environment Variables
              </p>
              <p style={{ margin: '0 0 8px 0', color: '#78350f', fontSize: '14px' }}>
                Please check your <code style={{ background: '#fde68a', padding: '2px 6px', borderRadius: '3px' }}>.env</code> file and ensure it contains:
              </p>
              <ul style={{ margin: '8px 0', paddingLeft: '20px', color: '#78350f', fontSize: '14px' }}>
                <li><code>VITE_SUPABASE_URL</code></li>
                <li><code>VITE_SUPABASE_ANON_KEY</code></li>
              </ul>
              <p style={{ margin: '12px 0 0 0', color: '#78350f', fontSize: '14px' }}>
                After adding these variables, restart the development server.
              </p>
            </div>
          )}
          <details style={{ marginTop: '20px' }}>
            <summary style={{ cursor: 'pointer', color: '#6b7280', fontSize: '14px' }}>
              Show error details
            </summary>
            <pre style={{
              marginTop: '12px',
              padding: '12px',
              background: '#f3f4f6',
              borderRadius: '4px',
              overflow: 'auto',
              fontSize: '12px',
              color: '#1f2937'
            }}>
              {this.state.error?.stack}
            </pre>
          </details>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              background: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

