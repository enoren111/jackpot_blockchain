// SPDX-License-Identifier: MIT

pragma solidity ^0.8.7;  // Specify Solidity version

// Import Chainlink VRF contracts from the master branch (or find a specific commit that contains stable versions)
import "./VRFConsumerBaseV2.sol";
import "./VRFCoordinatorV2Interface.sol";
// Import OpenZeppelin Ownable contract
import "./Ownable.sol";

contract LotteryGame is VRFConsumerBaseV2, Ownable {
    VRFCoordinatorV2Interface private COORDINATOR;
    uint64 private subscriptionId;
    address private vrfCoordinator;
    bytes32 private keyHash;
    uint32 private callbackGasLimit;
    uint16 private requestConfirmations;
    uint32 private numWords;
    uint256 public operationalBalance;

    uint256 public ticketPrice = 0.001 ether;
    uint256 public potSize;
    address[] private players;
    mapping(address => uint256) private playerEntries;
    mapping(uint256 => address[]) private entriesByNumber;
    uint256 private winningNumber;
    uint private lotteryEndTime;

    enum LOTTERY_STATE { OPEN, CLOSED, CALCULATING }
    LOTTERY_STATE public lotteryState;

    event LotteryStarted();
    event LotteryEnded();
    event PlayerEntered(address indexed player, uint256 chosenNumber);
    event WinnerSelected(uint256 winningNumber, address winner, uint256 amount);
    event FundReceived(address from, uint256 amount);
    event FundWithdrawn(address by, uint256 amount);

    constructor(
        address _vrfCoordinator,
        bytes32 _keyHash,
        uint64 _subscriptionId,
        uint32 _callbackGasLimit,
        uint16 _requestConfirmations,
        uint32 _numWords,
        address initialOwner
    )
        VRFConsumerBaseV2(_vrfCoordinator)
        Ownable(initialOwner)
    {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        vrfCoordinator = _vrfCoordinator;
        keyHash = _keyHash;
        subscriptionId = _subscriptionId;
        callbackGasLimit = _callbackGasLimit;
        requestConfirmations = _requestConfirmations;
        numWords = _numWords;
        lotteryState = LOTTERY_STATE.CLOSED;
    }

    function startLottery() public onlyOwner {
        require(lotteryState == LOTTERY_STATE.CLOSED, "Lottery already open");
        lotteryEndTime = block.timestamp + 1 minutes; // Set for 1 hour later
        lotteryState = LOTTERY_STATE.OPEN;
        emit LotteryStarted();
    }

    function endLottery() public onlyOwner {
        require(lotteryState == LOTTERY_STATE.OPEN, "Lottery not open");
        lotteryState = LOTTERY_STATE.CALCULATING;
        COORDINATOR.requestRandomWords(keyHash, subscriptionId, requestConfirmations, callbackGasLimit, numWords);
        emit LotteryEnded();
    }

    function checkEndLottery() public {
        require(lotteryState == LOTTERY_STATE.OPEN, "Lottery not open");
        if (block.timestamp > lotteryEndTime) {
            endLottery();
        } else {
            revert("Timer not up yet.");
        }
    }

    function enterLottery(uint256 chosenNumber) public payable {
        require(lotteryState == LOTTERY_STATE.OPEN, "Lottery is not open");
        require(msg.value == ticketPrice, "Incorrect payment");
        require(chosenNumber >= 1 && chosenNumber <= 50, "Invalid number");
        require(block.timestamp <= lotteryEndTime, "Lottery has ended");

        players.push(msg.sender);
        playerEntries[msg.sender] = chosenNumber;
        entriesByNumber[chosenNumber].push(msg.sender);
        potSize += msg.value;

        emit PlayerEntered(msg.sender, chosenNumber);
    }

    function fulfillRandomWords(uint256 _requestId, uint256[] memory randomWords) internal override {
        winningNumber = (randomWords[0] % 1) + 1;  // Assuming you want a range of 1-50
        address[] memory winners = entriesByNumber[winningNumber];
        uint256 winnerCount = winners.length;
        uint256 payout = winnerCount > 0 ? potSize / winnerCount : 0;

        if (winnerCount > 0) {
            for (uint i = 0; i < winnerCount; i++) {
                (bool sent, ) = payable(winners[i]).call{value: payout}("");
                require(sent, "Failed to send Ether");
            }
            potSize = 0;  // Reset the pot size after all transfers
        }

        lotteryState = LOTTERY_STATE.CLOSED;
        delete players;  // Consider the need and timing for deleting this data
        for (uint256 num = 1; num <= 50; num++) {
            delete entriesByNumber[num];
        }

        emit WinnerSelected(winningNumber, winners.length > 0 ? winners[0] : address(0), payout);
    }

    // Getter functions for the frontend
    function getPotSize() public view returns (uint256) {
        return potSize;
    }

    function getCurrentWinningNumber() public view returns (uint256) {
        return winningNumber;
    }

    function timeRemaining() public view returns (uint) {
        if (block.timestamp >= lotteryEndTime) {
            return 0; // No time remaining if the current time is past the end time
        } else {
            return lotteryEndTime - block.timestamp; // Remaining seconds until the lottery ends
        }
    }
    function getLotteryState() public view returns (LOTTERY_STATE) {
        return lotteryState;
    }

    // Allow anyone to send Ether to the contract
    function fundContract() public payable {
        operationalBalance += msg.value;
        emit FundReceived(msg.sender, msg.value);  // Log the funding event
    }

    // Allow only the owner to withdraw
    function withdrawForExpenses(uint256 amount) public onlyOwner {
        require(amount <= operationalBalance, "Insufficient funds");
        payable(msg.sender).transfer(amount);
        operationalBalance -= amount;
        emit FundWithdrawn(msg.sender, amount);  // Log the withdrawal event
    }

    // Fallback function to accept Ether when no other function matches the call
    fallback() external payable {
        fundContract();
    }

    // Receive function to accept plain Ether transfers
    receive() external payable {
        fundContract();
    }

    
}