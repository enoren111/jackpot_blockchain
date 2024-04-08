import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

// Reusing the Navbar and NavLink styled components from AboutPage.js
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

// Styled components specific to GamePage
const GameContainer = styled.div`
  text-align: center;
  padding: 20px;
`;

const JackpotDisplay = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
`;

const TimerDisplay = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
`;

const NumberDisplay = styled.div`
  font-size: 24px;
  margin-bottom: 20px;
`;

const NumberTable = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
  background-color: #4caf50;
  padding: 20px;
  border-radius: 10px;
`;

const NumberCell = styled.div`
  background-color: #fff;
  border: 1px solid #333;
  padding: 20px;
  cursor: pointer;
  // &:hover {
  //   background-color: #c8e6c9;
  // }
  background-color: ${props => props.isSelected ? '#c8e6c9' : '#fff'};
`;

const PlayButton = styled.button`
  padding: 10px 20px;
  font-size: 18px;
  margin-top: 20px;
  cursor: pointer;
`;

// GamePage component
const GamePage = () => {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [timer, setTimer] = useState(10);
  const [waitTimer, setWaitTimer] = useState(10);
  const [isWaitingForNextRound, setIsWaitingForNextRound] = useState(true);
  const [luckyNumber, setLuckyNumber] = useState('TBA');;
  const [jackpotAmount, setJackpotAmount] = useState('10,342 ETH');

  // Placeholder functions for game logic (to be implemented)
  const handleNumberClick = (number) => {
    setSelectedNumber(number);
  };

  const handlePlayClick = () => {
    // Game start logic here
    setSelectedNumber(generateLuckyNumber());
  };

  function generateLuckyNumber() {
    return Math.floor(Math.random() * 25) + 1;
  }

  useEffect(() => {
    let timerId;
    if (isWaitingForNextRound) {
      if (waitTimer === 0) {
        setLuckyNumber("TBA");
        setIsWaitingForNextRound(false);
        setTimer(10);
        setWaitTimer(10);
      } else {
        timerId = setTimeout(() => setWaitTimer(waitTimer - 1), 1000);
      }
    }
    else {
      if (timer === 0) {
        setLuckyNumber(generateLuckyNumber());
        setTimer(10);
        setIsWaitingForNextRound(true);
        return;
      }

      const timerId = setTimeout(() => {
        setTimer(timer - 1);
      }, 1000);

      return () => clearTimeout(timerId);
    }

  }, [timer,waitTimer,isWaitingForNextRound ]);

  return (
    <>
      <Navbar>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/game">Game</NavLink>
        <NavLink to="/account">Account</NavLink>
      </Navbar>
      <GameContainer>
        <JackpotDisplay>Jackpot: {jackpotAmount}</JackpotDisplay>
        {isWaitingForNextRound ? (
          <TimerDisplay>Time for Next Round: {waitTimer}</TimerDisplay>
        ) : (
          <TimerDisplay>Time Remaining: {timer}</TimerDisplay>
        )}
        <NumberDisplay>The lucky number is: {luckyNumber}</NumberDisplay>
        <NumberTable>
          {Array.from({ length: 25 }, (_, i) => i + 1).map((number) => (
            <NumberCell key={number} isSelected = {selectedNumber == number} onClick={() => handleNumberClick(number)}>
              {number}
            </NumberCell>
          ))}
        </NumberTable>
        <PlayButton onClick={handlePlayClick}>Place your bet</PlayButton>
        {luckyNumber && <div>Lucky Number: {luckyNumber}</div>}
      </GameContainer>
    </>
  );
};

export default GamePage;
