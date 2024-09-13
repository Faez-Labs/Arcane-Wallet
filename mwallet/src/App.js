import "./App.css";
import { useState } from 'react'

import { Select } from 'antd'
import {Routes, Route} from 'react-router-dom'
import Home from "./components/Home"
import CreateAccount from './components/CreateAccount'
import RecoverAccount from './components/RecoverAccount'
import WalletView from './components/WalletView'


function App() {
  const [wallet, setWallet] = useState(null);
  const [seedPhrase, setSeedPhrase] = useState(null);
  const [selectedChain, setSelectedChain] = useState("0x103D");

  return (
    <div className="App bg-[#222222]">
      <header className="bg-transparent">
        
        <Select
         value={selectedChain}
         onChange={(val) => setSelectedChain(val)}
         options={[
           {
             label: "CrossFi Testnet",
             value: "0x103D"
           },
           {
             label: "Sepolia Testnet",
             value: "0xaa36a7"
           }
         ]}
         className="dropdown"
       >
       </Select>
     </header>
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
        <Route path="/" element={<Home setWallet={setWallet} setSeedPhrase={setSeedPhrase} s/>}/>
        <Route path="/recover" element={<RecoverAccount setSeedPhrase={setSeedPhrase} setWallet={setWallet}/>}/>
        <Route path="/yourwallet" element={<CreateAccount setSeedPhrase={setSeedPhrase} setWallet={setWallet} />} />
      </Routes>      
      }
    </div>
  );
}

export default App;
