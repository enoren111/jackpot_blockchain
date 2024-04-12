pragma solidity ^0.8.7;  // Specify Solidity version

import "../lib/chainlink-brownie-contracts/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "../lib/chainlink-brownie-contracts/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "../lib/openzeppelin-contracts/contracts/access/Ownable.sol"; 

contract LotteryGame is VRFConsumerBaseV2, Ownable {
    // Configuration for Chainlink VRF Integration
    VRFCoordinatorV2Interface COORDINATOR; 
    uint64 subscriptionId; 
    address vrfCoordinator; 
    bytes32 keyHash = 0x474e34a077df58807dbe9c96d3c009b23b3c6d0cce433e59bbf5b34f823bc56c; 
    uint32 callbackGasLimit=200000;  
    uint16 requestConfirmations=10; 
    uint32 numWords=1;  

    // Lottery Variables
    uint256 public ticketPrice = 0.01 ether;
    uint256 public entryFee = 0.05 ether;
    uint256 public potSize;
    address[] public players;
    mapping(address => uint256) public playerEntries;  // Keep track of chosen numbers
    uint256 public lotteryStartTime;
    uint256 public lotteryDuration = 1 weeks; // Duration of one lottery cycle

    // State Variables
    enum LOTTERY_STATE { OPEN, CLOSED, CALCULATING }
    LOTTERY_STATE public lotteryState; 
    uint256 public winningNumber;
    address[] public winners;

    // Events for Frontend Communication
    event LotteryStarted(uint256 startTime);
    event PlayerEntered(address player, uint256 chosenNumber);
    event WinnerSelected(uint256 winningNumber, address[] winners); 
 
    constructor(
        uint64 _subscriptionId,
        address _vrfCoordinator
    ) VRFConsumerBaseV2(_vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        subscriptionId = _subscriptionId;
        vrfCoordinator = _vrfCoordinator;
        lotteryState = LOTTERY_STATE.CLOSED; // Start off closed
    }

    // Function to let players enter the lottery
    function enterLottery(uint256 _chosenNumber) public payable {
        require(lotteryState == LOTTERY_STATE.OPEN, "Lottery is not open");
        require(_chosenNumber >= 1 && _chosenNumber <= 50, "Invalid number");
        require(msg.value == ticketPrice + entryFee, "Incorrect payment");

        players.push(msg.sender);
        playerEntries[msg.sender] = _chosenNumber;
        potSize += entryFee;

        emit PlayerEntered(msg.sender, _chosenNumber);
    }

    // Starts a new lottery cycle (callable by owner or automated mechanism)
    function startLottery() external onlyOwner {
        require(lotteryState == LOTTERY_STATE.CLOSED, "Lottery already open");
        lotteryStartTime = block.timestamp;
        lotteryState = LOTTERY_STATE.OPEN;

        emit LotteryStarted(lotteryStartTime);
    }

    // Internal function triggered when time is up, requests randomness
    function _pickWinner() internal {
        require(lotteryState == LOTTERY_STATE.OPEN, "Lottery is not open");
        require(block.timestamp >= lotteryStartTime + lotteryDuration, "Lottery not over");

        lotteryState = LOTTERY_STATE.CALCULATING; 
        COORDINATOR.requestRandomWords(keyHash, subscriptionId, requestConfirmations, callbackGasLimit, numWords); 
    }


    // Chainlink VRF Integration callback
    function fulfillRandomWords(uint256, /* requestId */ uint256[] memory randomWords) internal override {
        require(lotteryState == LOTTERY_STATE.CALCULATING, "Wrong state"); 
        
        winningNumber = (randomWords[0] % 50) + 1; // Determine winning number

        // Find and pay winners
        for (uint256 i = 0; i < players.length; i++) {
            if (playerEntries[players[i]] == winningNumber) {
                winners.push(players[i]);
            }
        }

        if (winners.length > 0) {
            uint256 winningsPerWinner = potSize / winners.length;
            for (uint256 i = 0; i < winners.length; i++) {
                (bool success, ) = payable(winners[i]).call{value: winningsPerWinner}("");
                require(success, "Transfer failed");
            }
        } else { 
            // Rollover the pot
            //emit PotRollover(potSize); 
        }

        // Reset for next round
        lotteryState = LOTTERY_STATE.CLOSED; 
        winners = new address[](0);
        players = new address[](0); 
        lotteryStartTime = block.timestamp; // Begin a new lottery immediately
        lotteryState = LOTTERY_STATE.OPEN;
        emit LotteryStarted(lotteryStartTime); 
    }

    // Getter Functions for frontend
    function getPotSize() public view returns (uint256) {
        return potSize;
    }

    function getTimeRemaining() public view returns (uint256) {
        if (lotteryState != LOTTERY_STATE.OPEN) { 
            return 0; 
        }
        uint256 timeLeft = lotteryStartTime + lotteryDuration - block.timestamp;
        return timeLeft;
    }

}
