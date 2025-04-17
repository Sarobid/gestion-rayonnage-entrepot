import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/menu.css';
import './styles/App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';



const rootElement = document.getElementById('root'); 
const root = createRoot(rootElement); 
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
