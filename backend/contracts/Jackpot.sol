// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Lottery {
    address public owner;
    uint public drawTime;
    uint public bettingEndTime;
    uint public constant POINTS_PER_ETH = 1000; 
    uint public constant NUMBER_RANGE = 50; // Numbers from 1 to 50
    uint private luckyNumber;
    bool public drawOccurred = false;

    struct Bet {
        uint number;
        uint points;
    }

    mapping(address => Bet[]) private bets;
    mapping(uint => uint) public totalBetsOnNumber; // Total points bet on each number
    uint public totalPointsInPool;

    event BetPlaced(address indexed bettor, uint number, uint points);
    event Draw(uint luckyNumber);
    event WinningsPaid(address winner, uint amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action.");
        _;
    }

    modifier beforeBettingEnds() {
        require(block.timestamp <= bettingEndTime, "Betting phase has ended.");
        _;
    }

    modifier afterBettingEnds() {
        require(block.timestamp > bettingEndTime, "Betting phase is still active.");
        _;
    }

    constructor(uint _bettingDurationMinutes) {
        owner = msg.sender;
        bettingEndTime = block.timestamp + (_bettingDurationMinutes * 1 minutes);
    }

    function placeBet(uint number) external payable beforeBettingEnds {
        require(number >= 1 && number <= NUMBER_RANGE, "Number out of range.");
        uint points = msg.value * POINTS_PER_ETH;
        bets[msg.sender].push(Bet({number: number, points: points}));
        totalBetsOnNumber[number] += points;
        totalPointsInPool += points;

        emit BetPlaced(msg.sender, number, points);
    }

    function performDraw() external onlyOwner afterBettingEnds {
        require(!drawOccurred, "Draw has already occurred.");
        luckyNumber = _generateRandomNumber() + 1; // Ensures number is within 1-50
        drawOccurred = true;

        uint totalWinningPoints = totalBetsOnNumber[luckyNumber];
        if (totalWinningPoints > 0) {
            uint prizePool = address(this).balance;
            // Iterate over all bets to find winners and distribute winnings
            for (uint i = 1; i <= NUMBER_RANGE; i++) {
                if (i == luckyNumber) {
                    address[] memory winners = _getWinners(i, totalWinningPoints, prizePool);
                    for (uint j = 0; j < winners.length; j++) {
                        emit WinningsPaid(winners[j], bets[winners[j]][i].points);
                    }
                }
            }
        }

        emit Draw(luckyNumber);
    }

    // Simplified random number generation for demonstration. Use Chainlink VRF in production.
    function _generateRandomNumber() private view returns (uint) {
        return uint(keccak256(abi.encodePacked(block.difficulty, block.timestamp))) % NUMBER_RANGE;
    }

    function _getWinners(uint _number, uint totalWinningPoints, uint prizePool) private view returns (address[] memory) {
        uint winnerCount = 0;
        address[] memory tempWinners = new address[](totalWinningPoints); // Oversized array, will trim later

        // Placeholder loop. In a real contract, you would calculate and send winnings here.
        for (uint i = 0; i < tempWinners.length; i++) {
            // logic to populate winners
        }

        address[] memory winners = new address[](winnerCount);
        for (uint i = 0; i < winnerCount; i++) {
            winners[i] = tempWinners[i];
        }

        return winners;
    }

    function getLuckyNumber() public view returns (uint) {
        require(drawOccurred, "Draw has not occurred yet.");
        return luckyNumber;
    }
}
