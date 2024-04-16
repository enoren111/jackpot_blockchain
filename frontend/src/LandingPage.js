import React from 'react';
import styled from 'styled-components';

import MetaMaskLogo from './assets/images/logo.svg';

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin: 0.5rem;
`;

const Logo = styled.img`
  width: 150px;
  height: auto;
  margin: 20px 0;
`;

const SignUpButton = styled.button`
  background-color: #f0b90b;
  color: #ffffff;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  cursor: pointer;
  margin: 20px 0;
  &:hover {
    background-color: #e0a800;
  }
`;

const LandingPage = ({ onWalletConnect }) => {
  return (
    <PageContainer>
      <Title>Welcome to the Jackpot</Title>
      <Logo src={MetaMaskLogo} alt="MetaMask Logo" />
      <SignUpButton onClick={onWalletConnect}>Connect Wallet</SignUpButton>
    </PageContainer>
  );
};

export default LandingPage;
