import './styles/index.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles/_sisa.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <div id="app">
      <App />
    </div>
  </StrictMode>
);