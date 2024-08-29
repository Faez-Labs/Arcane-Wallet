import "./App.css";
import { useState } from 'react'
import logo from './logo_arcane.svg'
import { Select } from 'antd'
import {Routes, Route} from 'react-router-dom'
import Home from "./components/Home"
import CreateAccount from './components/CreateAccount'
import RecoverAccount from './components/RecoverAccount'
import WalletView from './components/WalletView'


function App() {
  const [wallet, setWallet] = useState(null);
  const [seedPhrase, setSeedPhrase] = useState(null);
  const [selectedChain, setSelectedChain] = useState("0x1");

  return (
    <div className="App bg-[#222222]">
      <div className="flex flex-row justify-center align-middle ">
          <img src={logo} className="headerLogo" alt="logo"/>
      </div>
      {/* <header className="bg-neutral-800">
        
         <Select
          value={selectedChain}
          onChange={(val) => setSelectedChain(val)}
          options={[
            {
              label: "CrossFi Testnet",
              value: "0x1" // The value here is the hex value of every testnet
            },
            {
              label: "Solana Devnet",
              value: "0x13881"
            }
          ]}
          className="dropdown"
        >
        </Select>
      </header> */}
      {wallet && seedPhrase ? 
      <Routes>
        <Route path="/yourwallet" element={<WalletView
          wallet={wallet}
          setWallet={setWallet}
          seedPhrase={seedPhrase}
          setSeedPhrase={setSeedPhrase}
          selectedChain={selectedChain}
        />} />
      </Routes>

      :
      
      <Routes>            
        <Route path="/" element={<Home/>}/>
        <Route path="/recover" element={<RecoverAccount setSeedPhrase={setSeedPhrase} setWallet={setWallet}/>}/>
        <Route path="/yourwallet" element={<CreateAccount setSeedPhrase={setSeedPhrase} setWallet={setWallet} />} />
      </Routes>      
      }
    </div>
  );
}

export default App;
