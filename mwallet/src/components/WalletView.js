import React, { useEffect, useState } from "react";
import { Divider, Tooltip, List, Avatar, Spin, Tabs, Input, Button, } from 'antd';
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import logo from "../logo_arcane.svg";
import axios from 'axios';
import { CHAINS_CONFIG } from '../chains';
import { ethers, Contract, formatUnits, formatEther, WebSocketProvider, parseUnits, parseEther  } from 'ethers';
import erc20Abi from '../erc20.json';
import contractSwap from '../bridge.json';
import { Random } from "@cosmjs/crypto";
import { DirectSecp256k1Wallet,DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { StargateClient, SigningStargateClient, coins } from '@cosmjs/stargate';
import { assertIsBroadcastTxSuccess } from '@cosmjs/stargate';
import { stringToPath } from "@cosmjs/crypto";
import { Registry } from "@cosmjs/proto-signing";
import { EthAccount } from './ethermintAccount'; 
import { toBech32, fromHex } from '@cosmjs/encoding';

const COSMOS_HD_PATH = stringToPath("m/44'/118'/0'/0/0");
const ETHEREUM_HD_PATH = stringToPath("m/44'/60'/0'/0/0");
const HD_PATHS = [COSMOS_HD_PATH, ETHEREUM_HD_PATH];
const linkTokenAddress = "0x779877A7B0D9E8603169DdbD7836e478b4624789"
const swapContractAddress = "0xC870B0A38c7dAfe53c08944760AD56bAB7711b8C"
function WalletView({wallet, setWallet, seedPhrase, setSeedPhrase, selectedChain,}) {
 
  const navigate = useNavigate();
  const [tokens, setTokens] = useState(null);
  const [nfts, setNfts] = useState(null);
  const [balance, setBalance] = useState(0);
  const [fetching, setFetching] = useState(true);
  const [amountToSend, setAmountToSend] = useState(null);
  const [sendToAddress, setSendToAddress] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [hash, setHash] = useState(null);
  const [linkBalance, setLinkBalance] = useState(0);
  const [linkAmount, setLinkAmount] = useState('');
  const [solAmount, setSolAmount] = useState('');
  const [cosmosAddress, setCosmosAddress] = useState('');

  // Define the ERC-20 ABI (just for balanceOf and approve functions)
  const erc20Abi = [
      "function balanceOf(address owner) view returns (uint256)",
      "function approve(address spender, uint256 amount) public returns (bool)"
  ];

  // Set up the provider and wallet
  const provider = new ethers.WebSocketProvider("wss://eth-sepolia.g.alchemy.com/v2/MfUnA2s_umweRKXbcFGe9jV7a9dEBX5a");
  const wallet2 = new ethers.Wallet(seedPhrase, provider);
  const linkContract = new ethers.Contract(linkTokenAddress, erc20Abi, wallet2);
  const swapContract = new ethers.Contract(swapContractAddress, contractSwap, wallet2);

  // Fetch the LINK balance of the user
  useEffect(() => {
      const fetchLinkBalance = async () => {
          try {
              const balance = await linkContract.balanceOf(wallet2);
              setLinkBalance(formatUnits(balance, 18)); // Adjust decimals according to LINK's decimals
          } catch (error) {
              console.error('Error fetching LINK balance:', error);
          }
      };
      fetchLinkBalance();
  }, [wallet2]);

  // Handle the swap logic
  const handleSwap = async () => {
    try {
        const amountToApprove = parseUnits(linkAmount, 18);
        const approveTx = await linkContract.approve(swapContractAddress, amountToApprove);
        console.log('Approve transaction hash:', approveTx.hash);
        await approveTx.wait();
        console.log('Approval confirmed');

        // Step 2: Call the swap function in your smart contract with swapId, amountIn, and receiver
        const swapTx = await swapContract.swap(Math.random().toString() , amountToApprove, solAmount);
        console.log('Swap transaction hash:', swapTx.hash);
        await swapTx.wait();
        console.log('Swap confirmed');

        alert("Swap successful!");

    } catch (error) {
        console.error('Error during swap:', error);
    }
};

  const items = [
    {
      key: "3",
      label: `Tokens`,
      children: (
        <>
          {tokens ? (
            <>
              <List
                className="text-white"
                bordered
                itemLayout="horizontal"
                dataSource={tokens}
                renderItem={(item, index) => (
                  <List.Item style={{ textAlign: "left", backgroundColor: "transparent", padding: "10px" }}>
                    <List.Item.Meta
                      avatar={<Avatar src={item.logo || logo} />}
                      title={<span className="text-white text-2xl font-sans font-bold">{item.symbol}</span>}
                      description={<span className="text-white text-2xl font-sans font-bold">{item.name}</span>}
                    />
                    <div className="text-white text-xl font-sans font-bold">
                      {(Number(item.balance)).toFixed(2)} Tokens
                    </div>
                  </List.Item>
                )}
              />
            </>
          ) : (
            <>
              <span style={{ color: "white", fontSize: "18px" }}>You seem to not have any tokens yet</span>
            </>
          )}
        </>
      ),
    },
    {
      key: "1",
      label: `Transfer`,
      children: <>
      <h3>Native Balance</h3>
      <h1>
        {balance.toFixed(2)} {CHAINS_CONFIG[selectedChain].ticker}
      </h1>
      <div className="sendRow">
        <p style={{ width: "90px", textAlign: "left" }}>To:</p>
        <Input
          value={sendToAddress}
          onChange={(e) => setSendToAddress(e.target.value)}
          placeholder="0x..."
        />
      </div>
      <div className="sendRow">
         <p style={{ width: "90px", textAlign: "left" }}>Amount:</p>
         <Input
          value={amountToSend}
          onChange={(e) => setAmountToSend(e.target.value)}
          placeholder="Native tokens you wish to send..."
         /> 
      </div>
      <Button
        style={{ width: "100%", marginTop: "20px", marginBottom: "20px" }}
        type="primary"
        onClick={() => sendTransaction(sendToAddress, amountToSend)}
      >
        Send Tokens
      </Button>
      {processing && (
        <>
          <Spin/>
          {hash && (
            <Tooltip title={hash}>
              <p>Hover For Tx Hash</p>
            </Tooltip>
          )}
        </>
      )}
      </>,
    },
    {
      key: "2",
      label: `Swap`,
      children: <>
      <div className="max-w-md mx-auto shadow-lg rounded-lg ">
            <h2 className="text-2xl font-semibold mb-4 text-center text-blue-600">Swap LINK for SOL</h2>
            <div className="mb-4">
                <label className="block text-white font-semibold mb-1">LINK Token Balance: {linkBalance}</label>
            </div>
            <div className="mb-4">
                <label className="block text-white font-semibold mb-1">LINK Amount</label>
                <input
                    type="text"
                    value={linkAmount}
                    onChange={(e) => setLinkAmount(e.target.value)}
                    placeholder="Enter LINK amount"
                    className="w-full p-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div className="mb-4">
                <label className="block text-white font-semibold mb-1">SOL Receiving Address</label>
                <input
                    type="text"
                    value={solAmount}
                    onChange={(e) => setSolAmount(e.target.value)}
                    placeholder="Enter SOL amount"
                    className="w-full p-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
            <div>
                <button
                    onClick={handleSwap}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                >
                    Swap
                </button>
            </div>
        </div>
      </>,
    },
  ];
  
  function convertToCosmosAddress(evmPublicKey) {
    // Convert the public key to a Uint8Array
    const pubkeyUint8Array = fromHex(evmPublicKey.slice(2)); // Remove 0x and convert to byte array
  
    // Encode the public key in Bech32 format with the CrossFi 'mx' prefix
    const cosmosAddress = toBech32('mx', pubkeyUint8Array);
    console.log("Cosmos Address 2: ", cosmosAddress);
    return cosmosAddress;
  }

  // const customAccountParser = (accountAny) => {
  //   if (accountAny.typeUrl === "/ethermint.types.v1.EthAccount") {
  //     const ethAccount = EthAccount.decode(accountAny.value);
  //     return {
  //       address: ethAccount.baseAccount?.address || '',
  //       pubkey: ethAccount.baseAccount?.pubKey,
  //       accountNumber: 750800,
  //       sequence: 0,
  //     };
  //   } else {
  //     throw new Error(`Unsupported account type: ${accountAny.typeUrl}`);
  //   }
  // };
  
  // // Register the Ethermint account type in the Registry
  // const customRegistry = new Registry();
  // customRegistry.register("/ethermint.types.v1.EthAccount", EthAccount);
  
  // async function createCustomSigningClient(rpcEndpoint, wallet) {
  //   return await SigningStargateClient.connectWithSigner(rpcEndpoint, wallet, {
  //     accountParser: customAccountParser,
  //     registry: customRegistry,
  //   });
  // }
  
  async function sendTransaction(recipient, amount) {
    const chain = CHAINS_CONFIG[selectedChain];
    if(chain.ticker === "ETH") {
      sendSepoliaTransaction(recipient, amount);
    } else {
      //sendCrossFiTransaction(mnemonic, recipient, amount);
    }
  }

  async function sendSepoliaTransaction(recipient, amount) {
    const provider = new WebSocketProvider("wss://eth-sepolia.g.alchemy.com/v2/MfUnA2s_umweRKXbcFGe9jV7a9dEBX5a");
    const wallet = new ethers.Wallet(seedPhrase, provider);

    try {
        const signedTx = await wallet.sendTransaction({
          to: recipient,
          value: parseUnits(amount, "ether"),
        });
        console.log('Transaction Hash:', signedTx.hash);

        const receipt = await signedTx.wait();
        console.log('Transaction was confirmed in block:', receipt.blockNumber);
    } catch (error) {
        console.error('Error sending transaction:', error);
    }  
  }

  async function createWallet() {
    const mnemonic = "soap taste cluster render violin piece wait found video rice calm weird"
    const cosmosWallet = await DirectSecp256k1Wallet.fromKey(fromHex(seedPhrase.slice(2)), 'mx');
      
    const [cosmosAccount] = await cosmosWallet.getAccounts();

    console.log("Cosmos Address:", cosmosAccount.address);
  }

  async function getAccountTokens(){
    setFetching(true)
    setCosmosAddress(convertToCosmosAddress(wallet));
    // createWallet();
    // convertToCosmosAddress(wallet);
    const crossFiRPC = "https://rpc.testnet.ms";
    const provider = new ethers.JsonRpcProvider(crossFiRPC);

    var url = `https://api.covalenthq.com/v1/crossfi-evm-testnet/address/${wallet}/balances_v2/`;
    try {
      const apiKey = "cqt_rQT6MxC333DgTwwxPWPPr6FBJkGB";
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        auth: {
          username: apiKey,
          password: '',  // Empty password because colon is used
        }
      });
      console.log(response.data);
      var items = response.data.data.items;
      const formattedBalances = items
        .map(item => ({
          symbol: item.contract_ticker_symbol,
          balance: item.balance / Math.pow(10, item.contract_decimals),
          logo: item.logo_url,
          address: item.contract_address,
          decimals: item.contract_decimals,
        }));
      setTokens(formattedBalances);
      const native = tokens.find((token) => token.symbol === "XFI");
      setBalance(native.balance);
      //setFetching(false);
    } catch (err) {
      console.log(err);
    } finally {
      //setLoading(false);
    }
    url = `https://api.covalenthq.com/v1/eth-sepolia/address/${wallet}/balances_v2/`;
    try {
      const apiKey = "cqt_rQT6MxC333DgTwwxPWPPr6FBJkGB";
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        auth: {
          username: apiKey,
          password: '',  // Empty password because colon is used
        }
      });
      console.log(response.data);
      var items = response.data.data.items;
      const formattedBalances = items
        .filter(item => item.contract_ticker_symbol !== null)  // Filter out items with null symbol
        .map(item => ({
          symbol: item.contract_ticker_symbol,
          balance: item.balance / Math.pow(10, item.contract_decimals),
          logo: item.logo_url,
          address: item.contract_address,
          decimals: item.contract_decimals,
        }));

      // Check if tokens already contain the formattedBalances based on contract_address
      const newBalances = formattedBalances.filter(formattedItem => 
        !tokens.some(token => token.address === formattedItem.address)
      );

      // Concatenate the two arrays only if new balances are found
      if (newBalances.length > 0) {
        setTokens(tokens.concat(newBalances));
      }

      setFetching(false);
    } catch (err) {
      console.log(err);
    } finally {
      //setLoading(false);
    }
  }


  function logout() {
    setSeedPhrase(null);
    setWallet(null);
    setNfts(null);
    setTokens(null);
    setBalance(0);
    navigate("/");
  }


  useEffect(() =>{
    if (!wallet || !selectedChain) return;
      setNfts(null);
      setTokens(null);
      setBalance(0);
      getAccountTokens();
  }, []);


  useEffect(() =>{
    if (!wallet) return;
      setNfts(null);
      setTokens(null);
      setBalance(0);
      getAccountTokens();
  }, [selectedChain]);

  return (
    <>
      <div className="content">
        <div className="logoutButton" onClick={logout}>
          <LogoutOutlined />
        </div>
        <div className="walletName">EVM Wallet</div>
        <Tooltip title={wallet}>
          <div className="text-white">
            {wallet.slice(0, 4)}...{wallet.slice(38)}
          </div>
        </Tooltip>
        <div className="walletName">Cosmos Wallet</div>
        <Tooltip title={cosmosAddress}>
          <div className="text-white">
            {cosmosAddress.slice(0, 4)}...{cosmosAddress.slice(38)}
          </div>
        </Tooltip>
        <Divider />
        {fetching ? (
          <Spin />
        ) : (
          <Tabs defaultActiveKey="1" items={items} className="walletView" />
        )}
      </div>
    </>
  );
}

export default WalletView;