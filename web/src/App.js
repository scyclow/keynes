
import './App.css';

import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

import Main from './Main'
import Page from './Page'
import About from './About'
import Bids from './Bids'
import Dev from './Dev'


import { useEthContext } from './hooks'



export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}



const basename = window.location.href.includes('steviep.xyz/keynes')
  ? '/keynes'
  : '/'


function Header() {
  const {
    provider,
    signer,
    connectedAddress,
    connected,
    onConnect,
    onDisconnect
  } = useEthContext()

  return (
    <header>
      <button onClick={onConnect}>Connect</button>
      <button onClick={onDisconnect}>Disconnect</button>
      {connectedAddress}
    </header>
  )

}

function App() {


  return (
    <>
      <BrowserRouter basename={basename}>
        <Header />
        <ScrollToTop />
        <Routes>
          <Route
            path="/participants/:id"
            element={
              <Page />
            }
          />

          <Route
            exact
            path="/"
            element={
              <Main />
            }
          />

          <Route
            exact
            path="/about"
            element={
              <About />
            }
          />

          <Route
            exact
            path="/bids"
            element={
              <Bids />
            }
          />

          <Route
            exact
            path="/dev"
            element={
              <Dev />
            }
          />

        </Routes>
      </BrowserRouter>
      <footer>
        <div>
          <div><a href="https://twitter.com/steviepxyz" target="_blank" rel="nofollow">twitter</a></div>
          <div><a href="https://discord.gg/9uA8WBFpcB" target="_blank" rel="nofollow">discord</a></div>
          <div>(c) 2022</div>
        </div>
      </footer>
    </>
  )
}

export default App;



