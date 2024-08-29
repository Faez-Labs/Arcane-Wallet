import React from "react";
import { Button, Card } from 'antd'
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import { useState } from 'react'
import { ethers } from 'ethers'

function CreateAccount({setWallet, setSeedPhrase}) {
  const [newSeedPhrase, setNewSeedPhrase] = useState(null);
  const navigate = useNavigate();


  function generateWallet() {
    const mnemonic = ethers.Wallet.createRandom().mnemonic.phrase;
    setNewSeedPhrase(mnemonic)
  }


  function setWalletAndMnemonic() {
    setSeedPhrase(newSeedPhrase)
    setWallet(ethers.Wallet.fromPhrase(newSeedPhrase).address)
  }

  return (
    <>
      <div className="content">
        <div className="mnemonic">
          <ExclamationCircleOutlined style={{fontSize: "20px"}}/>
          <div>
            Once you generate the seed phrase, save it securely in order to recover your wallet in future.
          </div>
        </div>
        <Button
          className="w-[90%] h-[4vh] text-neutral-800 font-bold bg-green-400 border-[#222222] mt-5 text-[1.3rem]"
          type="primary"
          onClick={() => generateWallet()}
        >
          Generate Seed Phrase
        </Button>
        <Card className="seedPhraseContainer">
          {newSeedPhrase && <pre style={{ whiteSpace: "pre-wrap" }}>{newSeedPhrase}</pre>}
        </Card>
        <Button
          type="primary"
          className="w-[90%] h-[4vh] hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 text-neutral-800 font-bold bg-green-400 border-[#222222] mt-5 text-[1.3rem]"
          onClick={() => setWalletAndMnemonic()}
        >
          Open Your New Wallet
        </Button>
        <p className="frontPageButton" onClick={() => navigate("/")}>
          Back Home
        </p>
      </div>
    </>
  );
}

export default CreateAccount;
