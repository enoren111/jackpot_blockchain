import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Web3 from 'web3';
import Modal from 'react-modal';
import Navbar from './components/Navbar';

import contractABI from './ABI.json';

const contractAddress = '0x9323a13949004db0d073a7835B7D396434cf2e05';
const web3 = new Web3(window.ethereum);
const lotteryContract = new web3.eth.Contract(contractABI, contractAddress);

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  margin-left: 10px;
  cursor: pointer;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 5px;

  &:hover {
    background-color: #45a049;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const GameDisplay = styled.div`
  margin:20px;
  display: flex;
  flex-wrap: wrap;
  flex-direction: row;
  justify-content:space-around;
  min-width: 600px;
`;

const GameInfo = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 20px;
  width:30%;
  border: solid 20px #64A7A5;
  border-radius: 15px;
`;

const StateDisplay = styled.div`
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: bold;
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
  background-color: #F5F5F5;
  padding: 5%;
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.2);
  border-radius: 20px;
  // margin: auto;
  width: 20%; 
  height: auto; 
`;

const NumberCell = styled.div`
  background-color: #334C50; 
  font-size:35px;
  color: white;
  border-radius: 10px;
  cursor: pointer;
  box-shadow: ${props => props.isSelected ? 'none' : '6px 0 0 #000, 0 6px 0 #000, 3px 3px 0 #000'};
  position: relative;

  &::before {
    content: '';
    display: block;
    padding-top: 100%; 
    float: left;
    pointer-events: none;
  }

  &::after {
    content: '';
    display: block;
    clear: both;
  }

  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  box-sizing: border-box; 

  overflow: hidden;
  min-width: 0; 

  &:disabled {
    background-color: #ccc; // Grey background for disabled state
    cursor: not-allowed;
  }
`;

const BetConfirmationModal = styled(Modal)`
  position: absolute;
  top: 40px;
  left: 40px;
  right: 40px;
  bottom: 40px;
  background: white;
  padding: 20px;
`;

const PlayButton = styled.button`
  padding: 10px 20px;
  font-size: 20px;
  margin-top: 20px;
  cursor: pointer;
  background-color: #4CAF50; // Green background for visibility
  color: white; // White text color
  border: none;
  border-radius: 5px;

  &:disabled {
    background-color: #ccc; // Grey background for disabled state
    cursor: not-allowed;
  }

  &:hover:enabled {
    background-color: #45a049; // Slightly darker green background on hover
  }

  grid-column: span 5;
`;


const GamePage = () => {
  const [selectedNumber, setSelectedNumber] = useState(null);
  const [timer, setTimer] = useState(null);
  const [jackpotAmount, setJackpotAmount] = useState("Loading...");
  const [luckyNumber, setLuckyNumber] = useState("TBA");
  const [isModalOpen, setModalOpen] = useState(false);
  const [lotteryState, setLotteryState] = useState(null);

  // Fetch and update state
  useEffect(() => {
    const fetchState = async () => {
      const state = await lotteryContract.methods.getLotteryState().call();
      setLotteryState(parseInt(state));
    };
    fetchState();
    const interval = setInterval(fetchState, 1000); // Fetch state every 5 seconds
    return () => clearInterval(interval);

  }, []);

  // Define button and state display logic
  const stateLabel = (state) => {
    const parsedState = parseInt(state); // Parse state as integer if it's returned as a string
    switch (parsedState) {
      case 0: return "OPEN";
      case 1: return "CLOSED";
      case 2: return "CALCULATING";
      default: return "UNKNOWN";  // Handle unknown or uninitialized state
    }
  };

  // Fetch the time remaining from the smart contract
  useEffect(() => {
    const updateTimeRemaining = async () => {
      try {
        const remaining = await lotteryContract.methods.timeRemaining().call();
        setTimer(remaining.toString()); // assuming the time is returned in seconds
      } catch (error) {
        console.error("Failed to fetch time remaining:", error);
      }
    };

    updateTimeRemaining();
    const interval = setInterval(updateTimeRemaining, 1000);
    return () => clearInterval(interval);
  }, []);

  // Update jackpot amount and winning number
  useEffect(() => {
    const updateData = async () => {
      const jackpot = await lotteryContract.methods.getPotSize().call();
      const number = await lotteryContract.methods.getCurrentWinningNumber().call();
      setJackpotAmount(web3.utils.fromWei(jackpot, 'ether') + ' ETH');
      setLuckyNumber(number.toString());
    };
    updateData();
    const interval = setInterval(updateData, 500);
    return () => clearInterval(interval);
  }, []);

  // Handle number selection
  const handleNumberClick = useCallback((number) => {
    setSelectedNumber(number);
  }, []);

  // Place a bet
  const handlePlayClick = useCallback(async () => {
    const accounts = await web3.eth.getAccounts();
    await lotteryContract.methods.enterLottery(selectedNumber).send({
      from: accounts[0],
      value: web3.utils.toWei('0.001', 'ether')
    });
    setModalOpen(false);
  }, [selectedNumber]);

  // Start and end lottery
  const handleStartLottery = useCallback(async () => {
    const accounts = await web3.eth.getAccounts();
    await lotteryContract.methods.startLottery().send({ from: accounts[0] });
  }, []);

  const handleEndLottery = useCallback(async () => {
    const accounts = await web3.eth.getAccounts();
    await lotteryContract.methods.endLottery().send({ from: accounts[0] });
  }, []);



  const fundContract = async () => {
    const accounts = await web3.eth.getAccounts();
    const contractAddress = '0x9323a13949004db0d073a7835B7D396434cf2e05';

    // Sending 0.3 Ether to the fundContract function
    const amountToSend = web3.utils.toWei("0.3", "ether"); // Convert 0.3 ETH to Wei

    const receipt = await web3.eth.sendTransaction({
      from: accounts[0],  // The account sending Ether
      to: contractAddress,
      value: amountToSend,  // The amount in Wei
      data: lotteryContract.methods.fundContract().encodeABI() // ABI for the transaction
    });

    console.log('Transaction successful:', receipt);
  };


  const contract = new web3.eth.Contract(contractABI, contractAddress);

  const withdrawFromContract = async () => {
    const accounts = await web3.eth.getAccounts();
    if (!accounts.length) {
      alert('Please connect to MetaMask.');
      return;
    }

    const amountInWei = web3.utils.toWei("0.3", "ether");

    try {
      await contract.methods.withdrawForExpenses(amountInWei).send({ from: accounts[0] });
      alert('Withdrawal successful!');
    } catch (error) {
      console.error('Withdrawal failed:', error);
      alert('Withdrawal failed. See console for more details.');
    }
  };

  return (
    <>
      <Navbar />

        <GameDisplay>
          <GameInfo>
            <div>
              <h1>JackPot TIME!!!</h1>
              
            </div>

            <StateDisplay>
              Lottery State: {lotteryState !== null ? stateLabel(lotteryState) : "Loading..."}
              <Button onClick={handleStartLottery} disabled={lotteryState !== 1}>Start Lottery</Button>
              <Button onClick={handleEndLottery} disabled={lotteryState !== 0}>End Lottery</Button>
            </StateDisplay>

            <JackpotDisplay>Jackpot: {jackpotAmount}</JackpotDisplay>
            <TimerDisplay>Next Round in: {timer ? `${timer} seconds` : "Not started"}</TimerDisplay>
            <NumberDisplay>The lucky number is: {lotteryState !== 1 ? 'TBA' : luckyNumber}</NumberDisplay>

            {/* <StateDisplay>
              Lottery State: {lotteryState !== null ? stateLabel(lotteryState) : "Loading..."}
              <Button onClick={handleStartLottery} disabled={lotteryState !== 1}>Start Lottery</Button>
              <Button onClick={handleEndLottery} disabled={lotteryState !== 0}>End Lottery</Button>
            </StateDisplay> */}

            <StateDisplay>
              Do you want to donate today?
              <Button onClick={fundContract}>Send 0.3 Ether</Button>
            </StateDisplay>
          </GameInfo>

          <NumberTable>
            {Array.from({ length: 50 }, (_, i) => i + 1).map((number) => (
              <NumberCell key={number} disabled={lotteryState !== 0} isSelected={selectedNumber === number} onClick={() => handleNumberClick(number)}>
                {number}
              </NumberCell>
            ))}
            <PlayButton disabled={!selectedNumber} onClick={() => setModalOpen(true)}>The number is {selectedNumber} Place your bet</PlayButton>
          </NumberTable>

          
        </GameDisplay>

      <BetConfirmationModal
        isOpen={isModalOpen}
        onRequestClose={() => setModalOpen(false)}
        contentLabel="Confirm Your Bet"
      >
        <h2>Confirm Your Bet for {selectedNumber}</h2>
        <p>The ticket price is 0.001 ETH. Do you confirm?</p>
        <button onClick={handlePlayClick}>Confirm</button>
        <button onClick={() => setModalOpen(false)}>Cancel</button>
      </BetConfirmationModal>
    </>
  );
};

export default GamePage;
