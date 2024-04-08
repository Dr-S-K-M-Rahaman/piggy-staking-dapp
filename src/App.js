import React, { useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import './App.css';
import Web3 from 'web3';
import contractABI from './contractABI.json';
import axios from 'axios';
import buttonClickSound from './button-click.mp3';
import logo from './logo.png';
import loadingSpinner from './loading-spinner.gif';

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState('');
  const [stakedAmount, setStakeAmount] = useState();
  const [tokenBalance, setTokenBalance] = useState(0);
  const [depositedAmount, setDepositedAmount] = useState(0);
  const [APR, setApr] = useState(0);
  const [reward, setReward] = useState(0);
  const [audio, setAudio] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionLink, setTransactionLink] = useState('');
  
  const contract = '0x07422B2C37358B1aeA1C73D51799b05e70e8a422';
  const recipientAddress = '3RSJZNvEEm6LiU664df4QohqeygqQztekPRnYCwaDBD5';
  const tokenMint = '7wpRRpdycAHhYsR8tCbbHip6kR9NxAVrN21Auq5g8CFk';
  const tokenAddress = '7wpRRpdycAHhYsR8tCbbHip6kR9NxAVrN21Auq5g8CFk';
  
  const solanaRpcUrl = "https://api.devnet.solana.com";

  const connection = new Connection(solanaRpcUrl);

  useEffect(() => {
    const loadAudio = async () => {
      try {
        const audioData = await import('./button-click.mp3');
        setAudio(audioData.default);
      } catch (error) {
        console.error('Error loading audio file:', error);
      }
    };
  
    loadAudio();
  }, []);
  
  const getDepositAmount = async () => {
    if (!web3) {
      // Create a new web3 instance if it's not available
    const _web3 = new Web3(Web3.givenProvider || 'https://sepolia.infura.io/v3/cd4d91bd753b485fa91edd565201a509');
    setWeb3(_web3);
    }
    try {
      if (web3) {
        const contractInstance = new web3.eth.Contract(contractABI, contract);
        const _userDeposit = await contractInstance.methods.getDeposit(walletAddress).call();
        let userDeposit = _userDeposit.toString();
        userDeposit = (userDeposit / 1000000000).toFixed(2);
        if (userDeposit > 0) {
          setDepositedAmount(userDeposit);
        } else setDepositedAmount(0);
        console.log('Deposited:', userDeposit);
      } else {
        console.error('Web3 instance not available');
        setDepositedAmount(0);
      }
    } catch (error) {
      console.error('Error fetching deposit amount:', error);
      setDepositedAmount(0);
    }
  };
  
  useEffect(() => {
    const _web3 = new Web3(Web3.givenProvider || 'https://sepolia.infura.io/v3/cd4d91bd753b485fa91edd565201a509');
    console.log('_web3 instance:', _web3);
    // getSolBalance();
    setWeb3(_web3);
    getDepositAmount();
    getTokenBalance();
    getApr();
    getReward();
  }, [walletAddress, tokenMint]);

  const handleButtonClick = async (e) => {
  // Check if the event target exists
  if (e.currentTarget) {
    // Visual effect
    e.currentTarget.classList.add('pressed');

    // Play the sound
    if (audio) {
      const audioElement = new Audio(audio);
      audioElement.currentTime = 0;
      await audioElement.play();
    }

    // Remove the 'pressed' class after a short delay (e.g., 200ms)
    setTimeout(() => {
      if (e.currentTarget) {
        e.currentTarget.classList.remove('pressed');
      }
    }, 200);
  }
};

  const handleStakeToken = async (tax_id) => {
    console.log(`Transection id: ${tax_id}`);
    const data = {
      userTaxId: tax_id,
    };
  
    try {
      console.log('Sending request body:', data);
      setIsProcessing(true);
      setTransactionLink(`https://explorer.solana.com/tx/${tax_id}?cluster=devnet`);
  
      const response = await axios.post('https://184.72.67.114:3001/staketoken',data);
      console.log('Response status:', response.status);
  
      if (response.status !== 200) {
        throw new Error(`Request failed with status code ${response.status}`);
      }
  
      if (!response.data) {
        throw new Error('Empty response data');
      }
      console.log('Response data:', response.data);
      // Update the user's data after a successful stake operation
      await refreshUserData();
      // Set the transaction link
      setTransactionLink(`https://explorer.solana.com/tx/${tax_id}?cluster=devnet`);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleUnstakeToken = async (tax_id) => {
    console.log(`Transection id: ${tax_id}`);
    const data = {
      userTaxId: tax_id,
    };
  
    try {
      console.log('Sending request body:', data);
      setIsProcessing(true);
      setTransactionLink(`https://explorer.solana.com/tx/${tax_id}?cluster=devnet`);
  
      const response = await axios.post('https://184.72.67.114:3001/unstaketoken',data);
      console.log('Response status:', response.status);
  
      if (response.status !== 200) {
        throw new Error(`Request failed with status code ${response.status}`);
      }
  
      if (!response.data) {
        throw new Error('Empty response data');
      }
      console.log('Response data:', response.data);
      // Update the user's data after a successful stake operation
      await refreshUserData();
      setIsProcessing(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleReInvestToken = async (tax_id) => {
    console.log(`Transection id: ${tax_id}`);
    const data = {
      userTaxId: tax_id,
    };
  
    try {
      console.log('Sending request body:', data);
      setIsProcessing(true);
      setTransactionLink(`https://explorer.solana.com/tx/${tax_id}?cluster=devnet`);
  
      const response = await axios.post('http://localhost:3001/reinvest',data);
      console.log('Response status:', response.status);
  
      if (response.status !== 200) {
        throw new Error(`Request failed with status code ${response.status}`);
      }
  
      if (!response.data) {
        throw new Error('Empty response data');
      }
      console.log('Response data:', response.data);
      // Update the user's data after a successful stake operation
      await refreshUserData();
      setIsProcessing(false);
    } catch (error) {
      console.error('Error:', error);
    }
  };
  
  const connectWallet = async () => {
    try {
      const { solana } = window;
      if (solana && solana.isPhantom) {
        await solana.connect();
        setIsConnected(true);
        setWalletAddress(solana.publicKey.toString());
        getDepositAmount();
        getTokenBalance();
        getApr();
        getReward();
      } else {
        alert('Solana Fantom wallet extension not found!');
      }
    } catch (error) {
      console.error('Error connecting to wallet:', error);
    }
  };
  
  useEffect(() => {
    if (web3) {
      getDepositAmount();
      getTokenBalance();
      getApr();
      getReward();
    }
  }, [web3]);
  
  const disconnectWallet = async () => {
    try {
      const { solana } = window;
      if (solana && solana.isPhantom) {
        await solana.disconnect();
        setIsConnected(false);
        setDepositedAmount(0);
        setReward(0);
        setStakeAmount();
        setTokenBalance(0);
        getApr();
      }
    } catch (error) {
      console.error('Error disconnecting from wallet:', error);
    }
  };

  const getTokenBalance = async () => {
    try {
      // Get the public key from the connected wallet
      const { solana } = window;
      const publicKey = solana.publicKey;
  
      // Fetch the user's token balance directly from the blockchain
      const userBalance = await connection.getTokenAccountBalance(
        await Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          new PublicKey(tokenMint),
          publicKey
        )
      );
      const _tokenBal = userBalance.value.uiAmount;
      const tokenBal = parseFloat(_tokenBal.toFixed(2)).toString();
      setTokenBalance(tokenBal);
      console.log("Token Balance:", tokenBal);
    } catch (error) {
      console.error('Error fitching token balance:', error);
    }
  }

  const getReward = async () => {
    if (!web3) {
      // Create a new web3 instance if it's not available
    const _web3 = new Web3(Web3.givenProvider || 'https://sepolia.infura.io/v3/cd4d91bd753b485fa91edd565201a509');
    setWeb3(_web3);
    }
    try {
      if (web3) {
        const contractInstance = new web3.eth.Contract(contractABI, contract);
        const rewardEarned = await contractInstance.methods.getUserReward(walletAddress).call();
        const earningString = rewardEarned.toString();
        const totalEarning = (earningString / 1000000000).toFixed(2);
        if (earningString > 0) {
          setReward(totalEarning);
        } else setReward(0);
        console.log('EarnedAmount:', totalEarning);
      } else {
        console.error('Web3 instance not available');
        setReward(0);
      }
    } catch (error) {
      console.error('Error fetching earning amount:', error);
      setReward(0);
    }
  };
  
  const stakeToken = async () => {
    try {
      // Get the public key from the connected wallet
      const { solana } = window;
      const publicKey = solana.publicKey;
  
      // Fetch the user's token balance directly from the blockchain
      const userBalance = await connection.getTokenAccountBalance(
        await Token.getAssociatedTokenAddress(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          new PublicKey(tokenMint),
          publicKey
        )
      );
  
      // Check if the staked amount is greater than the user's balance
      if (stakedAmount > userBalance.value.uiAmount) {
        // Create a centered alert box with tax bolt icon
        const alertBox = document.createElement('div');
        alertBox.classList.add('centered-alert');
  
        // Tax bolt icon
        const taxBoltIcon = document.createElement('i');
        taxBoltIcon.classList.add('fas', 'fa-bolt', 'tax-bolt-icon');
        alertBox.appendChild(taxBoltIcon);
  
        // Error message
        const errorMessage = document.createElement('p');
        errorMessage.textContent = 'Entered amount exceeds token balance';
        alertBox.appendChild(errorMessage);
  
        // Append the alert box to the body
        document.body.appendChild(alertBox);
  
        // Remove the alert box after a delay (e.g., 3 seconds)
        setTimeout(() => {
          alertBox.remove();
        }, 3000);
  
        return; // Exit the function early
      }
  
      // Fetch the recent block hash
      const recentBlockhash = await connection.getRecentBlockhash();
  
      // Derive the associated token account for the recipient
      const recipientPublicKey = new PublicKey(recipientAddress);
      const recipientAssociatedTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(tokenMint),
        recipientPublicKey
      );
  
      // Check if the recipient's associated token account exists
      const recipientAccountInfo = await connection.getAccountInfo(recipientAssociatedTokenAccount);
  
      // Create a new transaction
      const transaction = new Transaction({
        recentBlockhash: recentBlockhash.blockhash,
        feePayer: publicKey,
      });
  
      if (!recipientAccountInfo) {
        // If it doesn't exist, create it
        const createRecipientAccountInstruction = Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          new PublicKey(tokenMint),
          recipientAssociatedTokenAccount,
          recipientPublicKey,
          publicKey
        );
        transaction.add(createRecipientAccountInstruction);
      }
  
      // Derive the associated token account for the sender
      const senderAssociatedTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(tokenMint),
        publicKey
      );
  
      // Add a transfer instruction to the transaction
      transaction.add(
        Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          senderAssociatedTokenAccount,
          recipientAssociatedTokenAccount,
          publicKey,
          [],
          stakedAmount * 10 ** 9 // Convert to the token's decimal places (e.g., 9 for USDC-SPL)
        )
      );
  
      // Sign and send the transaction
      const signature = await solana.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signature.serialize());
      await connection.confirmTransaction(txid);
      console.log(`Transaction successful: https://explorer.solana.com/tx/${txid}?cluster=devnet`);
  
      await handleStakeToken(txid);
    } catch (error) {
      console.error('Error depositing token:', error);
    }
  };
  
  const unstakeToken = async () => {
    try {
      // Get the public key from the connected wallet
      const { solana } = window;
      const publicKey = solana.publicKey;
  
      // Fetch the recent block hash
      const recentBlockhash = await connection.getRecentBlockhash();
  
      // Derive the associated token account for the recipient
      const recipientPublicKey = new PublicKey(recipientAddress);
      const recipientAssociatedTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(tokenMint),
        recipientPublicKey
      );
  
      // Check if the recipient's associated token account exists
      const recipientAccountInfo = await connection.getAccountInfo(recipientAssociatedTokenAccount);
  
      // Create a new transaction
      const transaction = new Transaction({
        recentBlockhash: recentBlockhash.blockhash,
        feePayer: publicKey,
      });
  
      if (!recipientAccountInfo) {
        // If it doesn't exist, create it
        const createRecipientAccountInstruction = Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          new PublicKey(tokenMint),
          recipientAssociatedTokenAccount,
          recipientPublicKey,
          publicKey
        );
        transaction.add(createRecipientAccountInstruction);
      }
  
      // Derive the associated token account for the sender
      const senderAssociatedTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(tokenMint),
        publicKey
      );
  
      // Add a transfer instruction to the transaction
      transaction.add(
        Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          senderAssociatedTokenAccount,
          recipientAssociatedTokenAccount,
          publicKey,
          [],
          0
        )
      );
  
      // Sign and send the transaction
      const signature = await solana.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signature.serialize());
      await connection.confirmTransaction(txid);
      console.log(`Transaction successful: https://explorer.solana.com/tx/${txid}?cluster=devnet`);
      
      await handleUnstakeToken(txid);
      
    } catch (error) {
      console.error('Error depositing token:', error);
    }
  };

  const reinvetToken = async () => {
    try {
      // Get the public key from the connected wallet
      const { solana } = window;
      const publicKey = solana.publicKey;
  
      // Fetch the recent block hash
      const recentBlockhash = await connection.getRecentBlockhash();
  
      // Derive the associated token account for the recipient
      const recipientPublicKey = new PublicKey(recipientAddress);
      const recipientAssociatedTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(tokenMint),
        recipientPublicKey
      );
  
      // Check if the recipient's associated token account exists
      const recipientAccountInfo = await connection.getAccountInfo(recipientAssociatedTokenAccount);
  
      // Create a new transaction
      const transaction = new Transaction({
        recentBlockhash: recentBlockhash.blockhash,
        feePayer: publicKey,
      });
  
      if (!recipientAccountInfo) {
        // If it doesn't exist, create it
        const createRecipientAccountInstruction = Token.createAssociatedTokenAccountInstruction(
          ASSOCIATED_TOKEN_PROGRAM_ID,
          TOKEN_PROGRAM_ID,
          new PublicKey(tokenMint),
          recipientAssociatedTokenAccount,
          recipientPublicKey,
          publicKey
        );
        transaction.add(createRecipientAccountInstruction);
      }
  
      // Derive the associated token account for the sender
      const senderAssociatedTokenAccount = await Token.getAssociatedTokenAddress(
        ASSOCIATED_TOKEN_PROGRAM_ID,
        TOKEN_PROGRAM_ID,
        new PublicKey(tokenMint),
        publicKey
      );
  
      // Add a transfer instruction to the transaction
      transaction.add(
        Token.createTransferInstruction(
          TOKEN_PROGRAM_ID,
          senderAssociatedTokenAccount,
          recipientAssociatedTokenAccount,
          publicKey,
          [],
          0
        )
      );
  
      // Sign and send the transaction
      const signature = await solana.signTransaction(transaction);
      const txid = await connection.sendRawTransaction(signature.serialize());
      await connection.confirmTransaction(txid);
      console.log(`Transaction successful: https://explorer.solana.com/tx/${txid}?cluster=devnet`);
      
      await handleReInvestToken(txid);
      
    } catch (error) {
      console.error('Error depositing token:', error);
    }
  };

  const getApr = async () => {
    try {
      if (web3 && isConnected) {
        const contractInstance = new web3.eth.Contract(contractABI, contract);
        const currentApr = await contractInstance.methods.getApr().call();
        const aprString = currentApr.toString() / 10 ** 2;
        setApr(aprString);
        console.log('APR:', currentApr);
      } else {
        console.error('Web3 instance not available');
      }
    } catch (error) {
      console.error('Error fetching APR', error);
    }
  };
  
  const handleMaxClick = () => {
    if (tokenBalance > 0) {
      setStakeAmount(tokenBalance.toString());
    } else setStakeAmount(0);
  };

  const refreshUserData = async () => {
    try {
      const { solana } = window;
      if (solana && solana.isPhantom) {
        // Get the public key from the connected wallet
        const publicKey = solana.publicKey;
  
        // Fetch the user's data
        await getDepositAmount();
        await getTokenBalance();
        await getApr();
        await getReward();
      } else {
        console.error('Solana Phantom wallet extension not found');
      }
  
      // Check if web3 instance is available
      if (web3) {
        await getDepositAmount();
        await getApr();
        await getReward();
      } else {
        // Create a new web3 instance if it's not available
        const _web3 = new Web3(Web3.givenProvider || 'https://sepolia.infura.io/v3/cd4d91bd753b485fa91edd565201a509');
        setWeb3(_web3);
  
        await getDepositAmount();
        await getApr();
        await getReward();
      }
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };
  
  const showProcessingPopup = () => {
    setIsProcessing(true);
    setTransactionLink('');
  };

  const hideProcessingPopup = () => {
    setIsProcessing(false);
  };
  
  useEffect(() => {
    const interval = setInterval(refreshUserData, 10000); // Refresh every 10 seconds
  
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div>
      <header className="header">
        <div className="header-left">
          <img src={logo} alt="Piggy Bank Logo" className="logo" />
        </div>
        <div className="header-right">
          {isConnected ? (
            <button onClick={(e) => { disconnectWallet(); handleButtonClick(e); }}>Disconnect Wallet</button>
          ) : (
            <button onClick={(e) => { connectWallet(); handleButtonClick(e); }}>Connect Wallet</button>
          )}
        </div>
      </header>
      <main className="main">
      {isProcessing && (
        <div className="processing-popup">
          <div className="popup-content">
            <img src={loadingSpinner} alt="Loading spinner" className="loading-spinner" />
            <p>Processing transaction...</p>
            {transactionLink && (
              <a href={transactionLink} target="_blank" rel="noopener noreferrer">
                View Transaction
              </a>
            )}
          </div>
        </div>
      )}
        <div className="form-container">
          <div className='tokenBalance'>
            <b><span>Balance {tokenBalance} $PIGGY</span></b>
          </div>
          <div className="input-container">
            <input className='inputArea'
              type="number"
              placeholder="    Enter amount"
              value={stakedAmount}
              onChange={(e) => setStakeAmount(e.target.value)}
            /><br></br>
            <button className="maxBtn" onClick={(e) => { handleMaxClick(); handleButtonClick(e); }}>
              MAX
            </button>
          </div>
          <div className="button-container">
            <button className="stakeBtn" onClick={(e) => { stakeToken(); handleButtonClick(e); }} disabled={!isConnected}>
              STAKE
            </button>
            <button className="unstakeBtn" onClick={(e) => { unstakeToken(); handleButtonClick(e); }} disabled={!isConnected}>
              UNSTAKE
            </button>
          </div>
          <div className='aprPercent'>
            <p><b>APR <span className='aprColler'>{APR} </span>%</b></p>
          </div>
        </div>
        <div className="info-section">
          <div className="info-left">
            <p>Your Total Staked</p>
            <p>Your Total Earning</p>
          </div>
          <div className="info-right">
            <p>{depositedAmount} $PIGGY</p>
            <p>{reward} $PIGGY</p>
          </div>
        </div>
        <div className="claimBtn">
          <button onClick={(e) => { reinvetToken(); handleButtonClick(e); }}>
            Reinvest <span>{reward}</span> $PIGGY
          </button>
        </div>
      </main>
      <footer className="footer">
        <p>© 2024 Piggy Bank. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
