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
    encryptAndSavePrivateKey('password', ethers.Wallet.fromPhrase(newSeedPhrase).privateKey)
    setSeedPhrase(newSeedPhrase)
    setWallet(ethers.Wallet.fromPhrase(newSeedPhrase).address)
  }

  async function encryptPrivateKey(password, privateKey) {
    const encoder = new TextEncoder();
    const passwordKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    
    const salt = window.crypto.getRandomValues(new Uint8Array(16)); // generate a random salt
    const derivedKey = await window.crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256"
      },
      passwordKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt"]
    );
  
    const iv = window.crypto.getRandomValues(new Uint8Array(12)); // initialization vector
    const encryptedPrivateKey = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      derivedKey,
      encoder.encode(privateKey)
    );
  
    return {
      encryptedData: encryptedPrivateKey,
      iv: iv,
      salt: salt
    };
  }
  
  function openDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('cryptoWalletDB', 1);
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('keys')) {
          db.createObjectStore('keys', { keyPath: 'id' });
        }
      };
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject('Error opening IndexedDB');
      };
    });
  }
  
  // Function to save encrypted private key in IndexedDB
  async function saveEncryptedKeyToDB(encryptedData, iv, salt) {
    const db = await openDB();
    const transaction = db.transaction(['keys'], 'readwrite');
    const store = transaction.objectStore('keys');
  
    const data = {
      id: 'privateKey',
      encryptedData: encryptedData,
      iv: iv,
      salt: salt
    };
  
    store.put(data);
    return transaction.complete;
  }
  
  async function encryptAndSavePrivateKey(password, privateKey) {
    const { encryptedData, iv, salt } = await encryptPrivateKey(password, privateKey);
    await saveEncryptedKeyToDB(encryptedData, iv, salt);
    console.log('Encrypted private key saved to IndexedDB');
  }

  return (
    <>
      <div className="content">
        <h2 className="text-white font-bold text-[3rem]"> Arcane </h2>
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
