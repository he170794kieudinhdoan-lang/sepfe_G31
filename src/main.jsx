import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './app/app';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
);
