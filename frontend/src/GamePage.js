import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
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
  background-color: ${props => props.isSelected ? '#c8e6c9' : '#fff'};
  border: 1px solid #333;
  padding: 20px;
  cursor: ${props => props.isClickable ? 'pointer' : 'not-allowed'}; 
  transition: box-shadow 0.3s ease;
  border-radius: 5px;

  &:hover {
    box-shadow: ${props => props.isClickable ? '0 4px 8px rgba(0,0,0,0.1)' : 'none'};
  }
`;

const PlayButton = styled.button`
  padding: 10px 20px;
  font-size: 18px;
  margin-top: 20px;
  cursor: pointer;
`;

const GamePage = () => {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [timer, setTimer] = useState(10);
  const [waitTimer, setWaitTimer] = useState(10);
  const [isWaitingForNextRound, setIsWaitingForNextRound] = useState(true);
  const [luckyNumber, setLuckyNumber] = useState('TBA');
  const [jackpotAmount, setJackpotAmount] = useState('10,342 ETH');

  const handleNumberClick = (number) => {
    if (!isWaitingForNextRound) {
      setSelectedNumber(number);
    }
  };

  // const handlePlayClick = () => {
  //   // Game start logic here
  //   console.log("Bet placed. Game starts.");
  // };

  function generateLuckyNumber() {
    return Math.floor(Math.random() * 25) + 1;
  }

  const confirmSelection = () => {
    const isConfirmed = window.confirm(`Do you confirm your selection: Number ${selectedNumber}?`);
    if (isConfirmed) {
      console.log(`User confirmed selection: ${selectedNumber}`);
    } else {
      console.log(`User cancelled selection`);
    }
    setSelectedNumber(null);
  };

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
    } else {
      if (timer === 0) {
        setLuckyNumber(generateLuckyNumber());
        setTimer(10);
        setIsWaitingForNextRound(true);
      } else {
        timerId = setTimeout(() => setTimer(timer - 1), 1000);
      }
    }
    return () => clearTimeout(timerId);
  }, [timer, waitTimer, isWaitingForNextRound]);

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
            <NumberCell key={number} isSelected={selectedNumber === number} isClickable={!isWaitingForNextRound} onClick={() => handleNumberClick(number)}>
              {number}
            </NumberCell>
          ))}
        </NumberTable>
        <PlayButton onClick={confirmSelection}>Place your bet</PlayButton>
      </GameContainer>
    </>
  );
};

export default GamePage;
