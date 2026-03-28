import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './style.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return React.createElement(
        'div',
        {
          style: {
            minHeight: '100vh',
            padding: '24px',
            fontFamily: 'Arial, sans-serif',
            background: '#fff7f7',
            color: '#7f1d1d'
          }
        },
        React.createElement('h1', null, 'App failed to render'),
        React.createElement(
          'pre',
          { style: { whiteSpace: 'pre-wrap', lineHeight: 1.5 } },
          this.state.error?.stack || this.state.error?.message || 'Unknown render error'
        )
      );
    }

    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('app')).render(
  React.createElement(
    React.StrictMode,
    null,
    React.createElement(
      ErrorBoundary,
      null,
      React.createElement(App)
    )
  )
);
