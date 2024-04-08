import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Web3 from 'web3';
import { Link } from 'react-router-dom';

const Navbar = styled.nav`
  display: flex;
  justify-content: space-around;
  align-items: center;
  background-color: #f8f8f8;
  padding: 10px 50px;
`;

const NavLink = styled(Link)`
  color: #333;
  font-weight: bold;
  padding: 10px;
  text-decoration: none;
  cursor: pointer;
  &:hover {
    background-color: #ddd;
    border-radius: 4px;
  }
`;

const SectionHeader = styled.h2`
  text-align: left;
  font-size: 36px;
  margin: 20px;
  font-weight: bold;
  padding-left: 20px;
`;

const ProfilePictureContainer = styled.div`
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const ProfilePicture = styled.img`
  border-radius: 50%;
  width: 150px;
  height: 150px;
  object-fit: cover;
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 10px;
  padding: 20px;
`;

const ContentBlock = styled.div`
  text-align: center;
`;

const Label = styled.div`
  font-size: 18px;
  font-weight: bold;
`;

const AccountPage = ({ userAddress }) => {
  const [balance, setBalance] = useState('Loading...');
  // Assuming you might add logic to fetch and display jackpot points
  const [jackpotPoints, setJackpotPoints] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      if (userAddress && window.ethereum) {
        const web3 = new Web3(window.ethereum);
        const balanceWei = await web3.eth.getBalance(userAddress);
        const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
        setBalance(balanceEth);
      }
    };

    fetchBalance();
  }, [userAddress]);

  return (
    <>
      <Navbar>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/game">Game</NavLink>
        <NavLink to="/account">Account</NavLink>
      </Navbar>
      <SectionHeader>Account</SectionHeader>
      <ContentGrid>
        <ProfilePictureContainer>
          <ProfilePicture src="/profile.jpeg" alt="Profile" />
        </ProfilePictureContainer>
        <ContentBlock>
          <Label>User:</Label>
          <div>Anonymous</div>
        </ContentBlock>
        <ContentBlock>
          <Label>Address:</Label>
          <div>{userAddress || 'Not available'}</div>
        </ContentBlock>
        <ContentBlock>
          <Label>Wallet Balance:</Label>
          <div>{balance} ETH</div>
        </ContentBlock>
        {/* Add more ContentBlocks as needed */}
      </ContentGrid>
    </>
  );
};

export default AccountPage;
