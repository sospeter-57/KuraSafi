import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { ethers } from "ethers";
import KuraSafiABI from "../utils/KuraSafiABI.json";
import contractConfig from "../utils/contractAddress.json";

const Web3Context = createContext(null);

export function Web3Provider({ children }) {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask not found. Please install MetaMask.");
      return false;
    }
    setIsConnecting(true);
    setError(null);
    try {
      const _provider = new ethers.BrowserProvider(window.ethereum);
      await _provider.send("eth_requestAccounts", []);
      const _signer = await _provider.getSigner();
      const _account = await _signer.getAddress();
      const _contract = new ethers.Contract(
        contractConfig.contractAddress,
        KuraSafiABI,
        _signer
      );
      setProvider(_provider);
      setSigner(_signer);
      setContract(_contract);
      setAccount(_account);
      setIsConnected(true);
      return true;
    } catch (err) {
      setError(err.message || "Failed to connect wallet");
      return false;
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setProvider(null);
    setSigner(null);
    setContract(null);
    setAccount(null);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (!window.ethereum) return;
    window.ethereum.on("accountsChanged", (accounts) => {
      if (accounts.length === 0) disconnect();
      else setAccount(accounts[0]);
    });
    window.ethereum.on("chainChanged", () => window.location.reload());
    return () => {
      window.ethereum?.removeAllListeners?.("accountsChanged");
      window.ethereum?.removeAllListeners?.("chainChanged");
    };
  }, [disconnect]);

  return (
    <Web3Context.Provider value={{ provider, signer, contract, account, isConnected, isConnecting, error, connectWallet, disconnect }}>
      {children}
    </Web3Context.Provider>
  );
}

export const useWeb3 = () => {
  const ctx = useContext(Web3Context);
  if (!ctx) throw new Error("useWeb3 must be used within Web3Provider");
  return ctx;
};
