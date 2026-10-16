import React from 'react';
import { Wallet, AlertTriangle, LogOut, Loader2, ArrowRightLeft, X } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { truncateHash } from '../utils/formatters';
import { BOT_CHAIN_CONFIG } from '../lib/botchain';

export const WalletButton: React.FC = () => {
  const {
    address,
    chainId,
    isConnecting,
    isConnected,
    isCorrectNetwork,
    isMetaMaskInstalled,
    error,
    connectWallet,
    disconnectWallet,
    switchToBohrTestnet,
    clearError,
  } = useWallet();

  if (!isConnected) {
    return (
      <div className="relative">
        <button
          type="button"
          onClick={connectWallet}
          disabled={isConnecting}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Wallet className="w-3.5 h-3.5" />
          )}
          <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
        </button>

        {error && (
          <div className="absolute right-0 top-full mt-2 w-72 p-2.5 rounded-xl bg-rose-950 border border-rose-800 text-rose-200 text-xs shadow-lg z-50 flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <span className="font-semibold block text-[11px] uppercase tracking-wider text-rose-300">
                Connection Notice
              </span>
              <p className="text-[11px] leading-snug">{error}</p>
              {!isMetaMaskInstalled && (
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block text-[11px] text-indigo-300 underline mt-1"
                >
                  Download MetaMask
                </a>
              )}
            </div>
            <button
              onClick={clearError}
              className="text-rose-400 hover:text-white shrink-0 p-0.5 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    );
  }

  // Connected, but on the wrong network
  if (!isCorrectNetwork) {
    return (
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={switchToBohrTestnet}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-300 text-xs font-medium transition-colors cursor-pointer"
          title={`Connected to Chain ID ${chainId}. Click to switch to ${BOT_CHAIN_CONFIG.name} (${BOT_CHAIN_CONFIG.chainId}).`}
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>Switch to {BOT_CHAIN_CONFIG.shortName} ({BOT_CHAIN_CONFIG.chainId})</span>
          <ArrowRightLeft className="w-3 h-3 text-amber-400 shrink-0" />
        </button>

        <button
          type="button"
          onClick={disconnectWallet}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-slate-700 transition-colors cursor-pointer"
          title="Disconnect wallet"
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Connected on BOT Chain Bohr Testnet
  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200">
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="font-mono text-xs">{truncateHash(address || '', 6, 4)}</span>
      </div>

      <button
        type="button"
        onClick={disconnectWallet}
        className="p-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-slate-700 transition-colors cursor-pointer"
        title="Disconnect wallet"
      >
        <LogOut className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
