import React from 'react';
import { render } from 'react-snapshot';
import './index.css';
import App from './App';



window.CONTRACT_ADDR = '0xBD1cA111380B436350034c7040E7C44949605702'




render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

