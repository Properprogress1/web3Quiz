import React, { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import detectEthereumProvider from '@metamask/detect-provider';

function WalletConnectionHook() {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [isMetaMaskInstalled, setIsMetaMaskInstalled] = useState(false);
  const [balance, setBalance] = useState(null);
  const [address, setAddress] = useState('');

  useEffect(() => {
    const setup = async () => {
      const provider = await detectEthereumProvider();

      if (provider && provider === window.ethereum) {
        setIsMetaMaskInstalled(true);
        startApp(provider);
      } else {
        console.log('Please install MetaMask!');
      }
    };

    setup();

    window.ethereum.on('accountsChanged', (accounts) => {
      setAccount(accounts[0]);
      getBalance(accounts[0]);
    });

    window.ethereum.on('chainChanged', (chainId) => {
      setChainId(chainId);
      window.location.reload();
    });
  }, []);

  const startApp = async (provider) => {
    if (provider !== window.ethereum) {
      console.error('Do you have multiple wallets installed?');
    }

    const initialChainId = await provider.request({ method: 'eth_chainId' });
    setChainId(initialChainId);

    
    const accounts = await window.ethereum.request({method: "eth_requestAccounts"});
    setAccount(accounts);
    getBalance(accounts);
  };

  const getBalance = async () => {
    if (!address) {
        console.log("invalid address");
        return;
    }
     try {
        const provider = await new ethers.BrowserProvider(window.ethereum);
        const balance = await provider.getBalance(address); 
        console.log(balance);
        
        setBalance(ethers.formatEther(balance)); 
     } catch (error) {
           console.error("error getting balance", error);
           setBalance(null);
           
     }   
    }
    
  

  return {
    account,
    chainId,
    isMetaMaskInstalled,
    balance,
    address,
    setAddress,
    getBalance,
  };

};

function WalletConnectionComponent() {
  const { account, chainId, isMetaMaskInstalled, balance, address, setAddress, getBalance } = WalletConnectionHook();

  return (
    <div className="flex flex-col space-y-4 px-4 py-6 bg-white rounded-lg shadow-md">
  {isMetaMaskInstalled ? (
    <>
      <p className="text-base font-medium">Connected to MetaMask</p>
      <p className="text-base">Account: {account}</p>
      <p className="text-base">Chain ID: {chainId}</p>
      <p className="text-base">Balance:  {!balance ? "null": balance} ETH</p>
      <div className="flex items-center justify-between">
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        <button
          onClick={getBalance}
          className="px-4 py-2 rounded-md bg-blue-500 text-white hover:bg-blue-600 focus:outline-none"
        >
          Get Balance
        </button>
      </div>
    </>
  ) : (
    <p className="text-base">Please install MetaMask</p>
  )}
</div>
  );
}

export default WalletConnectionComponent;