import  express  from 'express'
import { WebSocketProvider, Contract, formatEther } from 'ethers'; // Updated for ethers v6
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { sendSol } from './solanaProgram.js';
const app = express();
const port = 3000;
dotenv.config()
// Create a WebSocket provider for the Sepolia test network
const provider = new WebSocketProvider(process.env.WSS_SEPOLIA);

const contractABI = JSON.parse(fs.readFileSync(path.join("", 'contract.json'), 'utf8'));
const contractAddress = "0x9788D2606443aa2e0D9b64447bcc130144C23C6e";
const contract = new Contract(contractAddress, contractABI, provider); // Updated for ethers v6

let events = [];

contract.on("Swap", (sender, receiver, ammount, tokenAdress, timeStamp, event) => {
  console.log(`New swap event: ${sender} swapped ${formatEther(ammount)} tokens to ${receiver}`);
  events.push({
    sender,
    receiver,
    ammount: formatEther(ammount),
    tokenAdress,
    timeStamp,
  });
  sendSol(ammount, receiver).catch(console.error);
});

app.get('/events', (req, res) => {
  res.json(events);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
