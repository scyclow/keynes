
import './App.css';

import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'

import Main from './Main'
import Page from './Page'




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

function App() {


  const responsiveStyle = window.innerWidth < 790 ? { height: '100vh'} : {}
  return (
    <>
      <BrowserRouter basename={basename}>
        <ScrollToTop />
        <Routes>
          <Route
            path="/packets/:id"
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



