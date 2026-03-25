
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

window.onerror = (msg, url, line, col, error) => {
  const root = document.getElementById('root');
  if (root) {
    root.innerHTML = `<div style="color: red; padding: 20px; font-family: monospace;">
      <h1>Error de Carga</h1>
      <p>${msg}</p>
      <pre>${error?.stack || ''}</pre>
    </div>`;
  }
  return false;
};

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error("Could not find root element");

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Quitar pantalla de carga tras renderizado
setTimeout(() => {
  const loader = document.getElementById('loading-screen');
  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => loader.remove(), 500);
  }
}, 300);
