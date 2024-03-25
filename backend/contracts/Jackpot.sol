// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Lottery {
    uint public drawTime; // Time when the draw happens
    uint public ticketPrice = 0.01 ether; // Price per ticket
    uint public pointsPerTicket = 10; // Points awarded per ticket purchase
    uint public luckyNumber; // The lucky number to be set at draw time
    bool public drawHappened = false;

    address public owner;
    mapping(address => uint) public playerNumbers; // Player's chosen number
    mapping(uint => address[]) public numberToPlayers; // Mapping of number to players who chose it
    uint public totalPool; // Total ETH pool

    event TicketPurchased(address indexed player, uint number, uint points);
    event DrawHappened(uint luckyNumber, uint totalWinners, uint prizePerWinner);

    constructor(uint _drawTimeFromNow) {
        owner = msg.sender;
        drawTime = block.timestamp + _drawTimeFromNow;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function.");
        _;
    }

    function buyTicket(uint _chosenNumber) external payable {
        require(msg.value == ticketPrice, "Incorrect amount of ETH sent.");
        require(block.timestamp < drawTime, "The draw has already happened.");
        require(_chosenNumber > 0, "Invalid number chosen.");

        totalPool += msg.value;
        playerNumbers[msg.sender] = _chosenNumber;
        numberToPlayers[_chosenNumber].push(msg.sender);

        emit TicketPurchased(msg.sender, _chosenNumber, pointsPerTicket);
    }

    function conductDraw(uint _luckyNumber) external onlyOwner {
        require(block.timestamp >= drawTime, "The draw time has not yet arrived.");
        require(!drawHappened, "Draw has already been conducted.");

        luckyNumber = _luckyNumber;
        drawHappened = true;

        address[] memory winners = numberToPlayers[luckyNumber];
        uint totalWinners = winners.length;
        uint prizePerWinner = totalWinners > 0 ? totalPool / totalWinners : 0;

        for(uint i = 0; i < totalWinners; i++) {
            payable(winners[i]).transfer(prizePerWinner);
        }

        // Emit an event with the draw results
        emit DrawHappened(luckyNumber, totalWinners, prizePerWinner);

        // Reset the lottery for the next round (not implemented here)
        // Considerations for resetting include handling the remaining ETH (if any), resetting variables, or self-destructing the contract.
    }

    // Utility function to check the balance of the contract
    function getContractBalance() public view returns (uint) {
        return address(this).balance;
    }

    // Utility function to check the draw time remaining
    function timeUntilDraw() public view returns (uint) {
        if(block.timestamp >= drawTime) {
            return 0;
        }
        return drawTime - block.timestamp;
    }
}
