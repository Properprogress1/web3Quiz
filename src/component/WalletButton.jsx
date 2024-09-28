import React, { useEffect, useState } from 'react';
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

    const web3 = new Web3(provider);
    const accounts = await web3.eth.getAccounts();
    setAccount(accounts[0]);
    getBalance(accounts[0]);
  };

  const getBalance = async (address) => {
    const web3 = new Web3(window.ethereum);
    const balance = await web3.eth.getBalance(address);
    setBalance(web3.utils.fromWei(balance, 'ether'));
  };

  return {
    account,
    chainId,
    isMetaMaskInstalled,
    balance,
    address,
    setAddress,
    getBalance,
  };
}

function WalletConnectionComponent() {
  const { account, chainId, isMetaMaskInstalled, balance, address, setAddress, getBalance } = WalletConnectionHook();

  return (
    <div>
      {isMetaMaskInstalled ? (
        <>
          <p>Connected to MetaMask</p>
          <p>Account: {account}</p>
          <p>Chain ID: {chainId}</p>
          <p>Balance: {balance} ETH</p>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} />
          <button onClick={() => getBalance(address)}>Get Balance</button>
        </>
      ) : (
        <p>Please install MetaMask</p>
      )}
    </div>
  );
}

export default WalletConnectionComponent;