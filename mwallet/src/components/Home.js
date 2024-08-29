import React from "react";
import mwallet from '../mwallet.png'
import { Button } from "antd";
import { useNavigate } from "react-router-dom";


function Home() {
  const navigate = useNavigate();

  return (
    <>
      <div className="content">
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
            onClick={() => navigate('/recover')}
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
