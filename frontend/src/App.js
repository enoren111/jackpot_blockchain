import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import AboutPage from './AboutPage';
import AccountPage from './AccountPage';
import GamePage from './GamePage';
import Tokenomics from './Tokenomics';
// Import other components if necessary

function App() {
  const [walletConnected, setWalletConnected] = useState(false);
  const [userAddress, setUserAddress] = useState('');

  const onWalletConnect = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts.length > 0) {
          setUserAddress(accounts[0]);
          setWalletConnected(true);
        }
      } catch (error) {
        console.error("Could not get accounts", error);
      }
    } else {
      console.log('MetaMask is not installed!');
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={!walletConnected ? <LandingPage onWalletConnect={onWalletConnect} /> : <Navigate to="/about" />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/account" element={<AccountPage userAddress={userAddress} />} />
          <Route path="/game" element={<GamePage />} />
          <Route path="/tokenomics" element={<Tokenomics />} />
          {/* Define other routes here */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
