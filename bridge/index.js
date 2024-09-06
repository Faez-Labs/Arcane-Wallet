import  express  from 'express'
import { WebSocketProvider, Contract, formatEther } from 'ethers'; // Updated for ethers v6
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const app = express();
const port = 3000;
dotenv.config()
// Create a WebSocket provider for the Sepolia test network
const provider = new WebSocketProvider(process.env.WSS_SEPOLIA);

const contractABI = JSON.parse(fs.readFileSync(path.join("", 'contract.json'), 'utf8'));
const contractAddress = "0x391cE92cf0fb6D66A737034d21dde6867457B607";
const contract = new Contract(contractAddress, contractABI, provider); // Updated for ethers v6

let events = [];

contract.on("Swap", (sender, receiver, ammount, event) => {
  console.log(sender + receiver + ammount)
});

app.get('/events', (req, res) => {
  res.json(events);
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
