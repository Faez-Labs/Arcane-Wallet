import React from "react";
import mwallet from '../mwallet.png'
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import logo from '../logo_arcane.svg'

function Home() {
  const navigate = useNavigate();
    // Function to retrieve encrypted private key from IndexedDB
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

  async function getEncryptedKeyFromDB() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['keys'], 'readonly');
      const store = transaction.objectStore('keys');
      const request = store.get('privateKey');

      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = () => {
        reject('Error retrieving the encrypted private key');
      };
    });
  }

  // Decryption function
  async function decryptPrivateKey(password, encryptedData, iv, salt) {
    const encoder = new TextEncoder();
    const passwordKey = await window.crypto.subtle.importKey(
      "raw",
      encoder.encode(password),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    
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
      ["decrypt"]
    );

    const decryptedPrivateKey = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv
      },
      derivedKey,
      encryptedData
    );

    const decoder = new TextDecoder();
    return decoder.decode(decryptedPrivateKey);
  }

  // Example usage to retrieve and decrypt the key
  async function retrieveAndDecryptPrivateKey(password) {
    const result = await getEncryptedKeyFromDB();
    if (!result) {
      console.error('No private key found in IndexedDB');
      return;
    }

    const { encryptedData, iv, salt } = result;

    const decryptedPrivateKey = await decryptPrivateKey(
      password,
      encryptedData,
      iv,
      salt
    );

    console.log('Decrypted Private Key:', decryptedPrivateKey);
  }

  return (
    <>
      <div className="content">
        <div className="flex flex-row justify-center align-middle ">
            <img src={logo} className="headerLogo" alt="logo"/>
        </div>
        <h2 className="text-white font-bold text-[3rem]"> Arcane </h2>
        <h4 className="text-[#999999] font-semi text-[1.2rem] ml-5 mr-5">Welcome to Arcane, start by creating a wallet</h4>
        <div className="flex flex-col w-full justify-center items-center h-[50vh]">
          <Button
            onClick={() => navigate('/yourwallet')}
            className="w-[90%] h-[4vh] text-neutral-800 font-bold bg-green-400 border-[#222222] mt-5 text-[1.3rem]"
            type="primary"
          >
          Create a Wallet
          </Button>
          <Button
            onClick={() => retrieveAndDecryptPrivateKey('password')}
            className="w-[90%] h-[4vh] text-white bg-[#222222] border-[#222222] mt-5 text-[1.3rem]"
            type="default"
          >
          Already have a Wallet   
          </Button>  
        </div>
          <p className="text-[#999999] self-center mb-5">
            by Faez Labs
          </p>
      </div>
    </>
  );
}

export default Home;
