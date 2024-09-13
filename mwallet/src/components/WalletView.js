import React, { useEffect, useState } from "react";
import { Divider, Tooltip, List, Avatar, Spin, Tabs, Input, Button, } from 'antd';
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import logo from "../logo_arcane.svg";
import axios from 'axios';
import { CHAINS_CONFIG } from '../chains';
import { ethers, Contract, formatEther  } from 'ethers';
import erc20Abi from '../erc20.json';

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
                  <List.Item style={{ textAlign: "left" }}>
                    <List.Item.Meta
                      avatar={<Avatar src={item.logo || logo} />}
                      title={item.symbol}
                      description={item.name}
                    />
                    <div className="text-white">
                      {(
                        Number(item.balance)
                      ).toFixed(2)}{" "}
                      Tokens
                    </div>
                  </List.Item>
                )}
              />
            </>
          ) : (
            <>
              <span>You seem to not have any tokens yet</span>
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
  ];


  async function sendTransaction(to, amount){
     const chain = CHAINS_CONFIG[selectedChain];
     const provider = new ethers.JsonRpcProvider(chain.rpcUrl);
     const privateKey = ethers.Wallet.fromPhrase(seedPhrase).privateKey;
     const wallet = new ethers.Wallet(privateKey, provider);

     const tx = {
      to: to,
      value: ethers.parseEther(amount.toString()),
     };


     setProcessing(true);
     try {
      const transaction = await wallet.sendTransaction(tx);

      setHash(transaction.hash);
      const receipt = await transaction.wait();

      setHash(null);
      setProcessing(false);
      setAmountToSend(null);
      setSendToAddress(null);

      if (receipt.status == 1) {
        getAccountTokens();
      } else {
        console.log("failed.");
      }

     } catch (err) {
      setHash(null);
      setProcessing(false);
      setAmountToSend(null);
      setSendToAddress(null);
     }
  }


  async function getAccountTokens(){
    setFetching(true)
    const crossFiRPC = "https://rpc.testnet.ms";
    const provider = new ethers.JsonRpcProvider(crossFiRPC);
    const contractAddress = "0xdb5c548684221ce2f55f16456ec5cf43a028d8e9";
    const tokenContract = new Contract(contractAddress, erc20Abi, provider); 
    const balance = await tokenContract.balanceOf(wallet);
    const symbol = await tokenContract.symbol();
    const decimals = await tokenContract.decimals();
    const url = `https://api.covalenthq.com/v1/crossfi-evm-testnet/address/${wallet}/balances_v2/`;
    try {
      const apiKey = "cqt_rQKvDVYp7GpH9FGx6jh8kpDHcxgC";
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        },
        auth: {
          username: apiKey,
          password: '',  // Empty password because colon is used
        }
      });
      const items = response.data.data.items;
      const formattedBalances = items.map(item => ({
        symbol: item.contract_ticker_symbol,
        balance: item.balance / Math.pow(10, item.contract_decimals),
        logo: item.token_logo_url,
        address: item.contract_address,
        decimals: item.contract_decimals,
      }));
      setTokens(formattedBalances);
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
        <div className="walletName">Wallet</div>
        <Tooltip title={wallet}>
          <div className="text-white">
            {wallet.slice(0, 4)}...{wallet.slice(38)}
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