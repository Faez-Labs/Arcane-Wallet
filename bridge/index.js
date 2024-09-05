const express = require('express');
const { ethers } = require('ethers');

const app = express();
const port = 3000;

const provider = new ethers.providers.JsonRpcProvider("");
const contractABI = [
 
];
const contractAddress = "";
const contract = new ethers.Contract(contractAddress, contractABI, provider);

let events = [];

contract.on("TokenSwapped", (sender, amount, destinationChain, event) => {
  console.log(`Event detected from ${sender}`);
  const formattedAmount = ethers.utils.formatEther(amount);

  const eventData = {
    sender,
    amount: formattedAmount,
    destinationChain,
    txHash: event.transactionHash,
  };

  events.push(eventData);
});

app.get('/events', (req, res) => {
  res.json(events);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
