import React from 'react';
import { render } from 'react-snapshot';
import './index.css';
import App from './App';
import { EthContextProvider } from './config'



window.CONTRACT_ADDR = '0xBD1cA111380B436350034c7040E7C44949605702'




render(
  <React.StrictMode>
    <EthContextProvider>
      <App />
    </EthContextProvider>
  </React.StrictMode>,
  document.getElementById('root')
);

