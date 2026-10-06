import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource/geist-sans/400.css';
import '@fontsource/geist-sans/500.css';
import '@fontsource/geist-sans/600.css';
import '@fontsource/geist-mono/400.css';
import '@fontsource/newsreader/300.css';
import '@fontsource/newsreader/400.css';
import './styles/tokens.css';
import './styles/app.css';
import { App } from './App';
import { StoreProvider } from './state';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <StoreProvider>
      <App />
    </StoreProvider>
  </React.StrictMode>,
);
