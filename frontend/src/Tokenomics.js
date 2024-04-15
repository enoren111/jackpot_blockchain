import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

// Define your styled components here
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



// Define your AboutPage component
const Tokenomics = () => {
  return (
    <>
      <Navbar>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/game">Game</NavLink>
        <NavLink to="/account">Account</NavLink>
      </Navbar>
      <SectionHeader>Tokenomics:</SectionHeader>
      <ContentGrid>
        <ProfilePictureContainer>
          <ProfilePicture src="/tokenomics.jpg" alt="Tokenomics" />
        </ProfilePictureContainer>
        <ContentBlock>
          <div>The current implementation of JackPotChain was primarily tested Sepolia TestNet. </div> 
          <div>  We will also support Ether network transactions. The game can be expanded to support governance tokens.</div>
          <div> Please see our white paper for full information.</div>
        </ContentBlock>
      </ContentGrid>
    </>
  );
};

export default Tokenomics;
