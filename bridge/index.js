import  express  from 'express'
import { WebSocketProvider, Contract, formatEther } from 'ethers'; // Updated for ethers v6
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { sendSol } from './solanaProgram.js';
import { log } from 'console';
import Moralis from 'moralis';

const app = express();
const port = 3000;
dotenv.config()
// Create a WebSocket provider for the Sepolia test network
const provider = new WebSocketProvider(process.env.WSS_SEPOLIA);
const contractABI = JSON.parse(fs.readFileSync(path.join("", 'contract.json'), 'utf8'));
const contractAddress = "0xC870B0A38c7dAfe53c08944760AD56bAB7711b8C";
const contract = new Contract(contractAddress, contractABI, provider); // Updated for ethers v6

let events = [];
let logs = [];
const receivedState = "RECEIVED";
const pendingState = "PENDING";
const successState = "SUCCESS";
const failureState = "FAILURE";

contract.on("Swap", async (swapId, sender, receiver, ammount, tokenAdress, timeStamp, event) => {
  console.log(`New swap event: ${sender} swapped ${ammount} tokens to ${receiver}`);
  logs.push(`New swap event: ${sender} swap ammount ${ammount} tokens to ${receiver}`)
  events.push({
    swapId: swapId,
    sender: sender,
    receiver: receiver,
    ammount: ammount.toString(),
    tokenAdress: tokenAdress,
    timeStamp: timeStamp.toString(),
    state: receivedState
  });
  logs.push('Start sending SOL to receiver');
  const ammountInSol = 10000;
  events[events.length - 1].state = pendingState;
  logs.push(`Swap: ${swapId} Sending ${ammountInSol} SOL to ${receiver}`);
  let xfiPriceInSol;
  try {
    const response = await fetch('https://api.diadata.org/v1/assetQuotation/Ethereum/0xC8CeED65E236F7d6fB378b8715f9e6912e486A54');
    const data = await response.json();
    xfiPriceInSol = data.Price;
    logs.push(`Fetched XFI price: 1 XFI = ${xfiPriceInSol} SOL`);
  } catch (error) {
    console.error(`Error fetching XFI price: ${error}`);
    logs.push(`Swap: ${swapId} Error fetching XFI price: ${error}`);
    events[events.length - 1].state = failureState;
    return;
  }
  sendSol(ammountInSol, receiver).catch(
    (error) => {
      console.error(`Error sending SOL: ${error}`);
      events[events.length - 1].state = failureState;
      logs.push(`Swap: ${swapId} Error sending SOL: ${error}`);
    }
  );
  events[events.length - 1].state = successState;
});

app.get('/events', (req, res) => {
  res.json(events);
});

app.get('/logs', (req, res) => {
  res.json(logs);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
