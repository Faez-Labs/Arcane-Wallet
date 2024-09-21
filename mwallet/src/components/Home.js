import React, { useEffect } from "react";
import mwallet from '../mwallet.png'
import { Button } from "antd";
import { useNavigate } from "react-router-dom";
import logo from '../logo_arcane.svg'
import { ethers } from 'ethers'

function Home({setWallet, setSeedPhrase}) {
  const navigate = useNavigate();
  const [loading, setLoading] = React.useState(true);
  const [hasWallet, setHasWallet] = React.useState(false);
  const [password, setPassword] = React.useState("");

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
    const wallet = new ethers.Wallet(decryptedPrivateKey);
    console.log('Decrypted Private Key:', decryptedPrivateKey);
    console.log('Wallet Address:', wallet.address);
    setWallet(wallet.address);
    setSeedPhrase(decryptedPrivateKey);
    navigate('/yourwallet');
  }

  async function deleteEncryptedKeyFromDB() {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(['keys'], 'readwrite');
      const store = transaction.objectStore('keys');
      const request = store.delete('privateKey');

      request.onsuccess = () => {
        resolve('Encrypted private key deleted successfully');
      };
      request.onerror = () => {
        reject('Error deleting the encrypted private key');
      };
    });
  }

  useEffect(() => {
    getEncryptedKeyFromDB().then((result) => {
      if (!result) {
        setLoading(false);
        setHasWallet(false);
      } else {
        setLoading(false);
        setHasWallet(true);
      }
    });
    
  }, []);

  return (
    <>
      {loading ?
        <>
          <div className="content">
            <div className="flex flex-row justify-center align-middle ">
                <img src={logo} className="headerLogo" alt="logo"/>
            </div>
          </div>
        </>
        : 
        <>
          {
            hasWallet ?
            <>
              <div className="content">
                <div className="flex flex-row justify-center align-middle ">
                  <img src={logo} className="headerLogo" alt="logo"/>
                </div>
                <h2 className="text-white font-bold text-[3rem]"> Arcane </h2>
                <h4 className="text-[#999999] font-semi text-[1.2rem] ml-5 mr-5">Enter your password:</h4>
                <div className="flex flex-col w-full justify-center items-center h-[50vh]">
                  <input
                    onChange={(e) => setPassword(e.target.value)} 
                    className="w-[90%] h-[4vh] rounded-md p-4 text-white bg-[#222222] border-[#22c55e] border-2 mt-5 text-[1.3rem]"
                    type="password"
                    placeholder="Password"
                  />
                  <Button
                    onClick={() => retrieveAndDecryptPrivateKey(password)}
                    className="w-[90%] h-[4vh] text-neutral-800 font-bold bg-green-400 border-[#222222] mt-5 text-[1.3rem]"
                    type="primary"
                  >
                  Access Wallet
                  </Button>
                  <span
                    onClick={() => deleteEncryptedKeyFromDB()}
                    className="text-red-500 self-center mt-5 cursor-pointer"
                  >
                    Delete Wallet
                  </span>
                </div>
                <p className="text-[#999999] self-center mb-5">
                  by Faez Labs
                </p>
              </div>
            </>
            :
            <div className="content">
              <div className="flex flex-col justify-center align-middle items-center">
                  <img src={logo} className="headerLogo" alt="logo"/>
                  <h2 className="text-white font-bold text-[3rem]"> Arcane </h2>
              </div>
              <h4 className="text-[#999999] font-semi text-[1.2rem] ml-5 mr-5">Welcome to Arcane.</h4>
              <div className="flex flex-col w-full justify-center items-center h-[80vh]">
                <Button
                  onClick={() => navigate('/yourwallet')}
                  className="w-[90%] h-[60px] text-neutral-800 font-bold bg-green-400 border-[#222222] mt-5 text-[1.3rem]"
                  type="primary"
                >
                Create a Wallet
                </Button>
                <Button
                  onClick={() => navigate('/recover')}
                  className="w-[90%] h-[60px] text-white bg-[#222222] border-[#222222] mt-5 text-[1.3rem]"
                  type="default"
                >
                Already have a Wallet   
                </Button>  
              </div>
              <p className="text-[#999999] self-center mb-5">
                by Faez Labs
              </p>
            </div>
          }
        </>
      }
      
    </>
  );
}

export default Home;
