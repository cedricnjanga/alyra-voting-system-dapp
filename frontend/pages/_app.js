import React, { useCallback, useState } from "react";
import { ethers } from "ethers";

import Layout from "../components/Layout";
import { WalletProvider } from '../src/walletContext';
import contractABI from '../src/voting.json'
import { getContractState } from "../src/helpers";

import '../styles/globals.css';
function MyApp({ Component, pageProps, contractState }) {
  const [flashMessages, setFlashMessage] = useState(new Set());

  const addFlashMessage = value => {
    let list

    list = new Set(flashMessages)
    list.add(value);

    setFlashMessage(list);

    setTimeout(() => {
      list =  new Set(flashMessages);
      list.delete(value);

      setFlashMessage(list);
    }, 3000);
  };


  const { voters, proposals, ...contract } = contractState;

  contractState = {
    ...contract,
    voters: new Map(Object.entries(voters)),
    proposals: new Map(Object.entries(proposals)),
  }

  return (
    <WalletProvider
      contractState={contractState}
      flashMessages={flashMessages}
      addFlashMessage={addFlashMessage}
    >
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </WalletProvider>
  )
}

MyApp.getInitialProps = async () => {
  const provider = new ethers.providers.JsonRpcProvider('http://127.0.0.1:8545/')
  const contract = new ethers.Contract('0x5FbDB2315678afecb367f032d93F642f64180aa3', contractABI, provider);

  const contractState = await getContractState(contract);
  return { contractState }
}

export default MyApp
