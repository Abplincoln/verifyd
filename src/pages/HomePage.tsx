import React from 'react';
import {
  FilePlus2,
  FileCheck2,
  ArrowRight,
  ExternalLink,
  Fingerprint,
  Lock,
} from 'lucide-react';
import type { ActivePage } from '../types/document';
import { BOT_CHAIN_CONFIG } from '../lib/botchain';
import { Badge } from '../components/Badge';
import { truncateHash } from '../utils/formatters';

interface HomePageProps {
  onNavigate: (page: ActivePage) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <Fingerprint className="w-3.5 h-3.5 text-indigo-400" />
          <span>Built on BOT Chain Mainnet</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
          Verify what you can <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-200 to-emerald-300">prove</span>.
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Verifyd uses <strong className="text-white font-semibold">BOT Chain</strong> to register and verify document fingerprints. Anyone can verify document authenticity in seconds without exposing confidential contents.
        </p>

        {/* CTA Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-6 text-left max-w-3xl mx-auto">
          {/* Issue Document CTA */}
          <div
            onClick={() => onNavigate('issue')}
            className="group relative rounded-2xl border border-slate-800 bg-slate-900/70 p-6 hover:border-indigo-500/60 hover:bg-slate-900/90 transition-all cursor-pointer shadow-lg hover:shadow-indigo-950/30 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo-600/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-5 group-hover:scale-105 group-hover:bg-indigo-600/25 transition-all">
                <FilePlus2 className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white group-hover:text-indigo-200 transition-colors">
                  Issue Document
                </h3>
                <span className="text-xs text-indigo-400 font-medium">Issuer Flow</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Select a document to compute its cryptographic SHA-256 fingerprint locally in your browser. Anchor the hash on the BOT Chain registry using your wallet.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-400 group-hover:text-indigo-300">
              <span>Go to Issue Flow</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Verify Document CTA */}
          <div
            onClick={() => onNavigate('verify')}
            className="group relative rounded-2xl border border-slate-800 bg-slate-900/70 p-6 hover:border-emerald-500/60 hover:bg-slate-900/90 transition-all cursor-pointer shadow-lg hover:shadow-emerald-950/30 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-5 group-hover:scale-105 group-hover:bg-emerald-600/25 transition-all">
                <FileCheck2 className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-white group-hover:text-emerald-200 transition-colors">
                  Verify Document
                </h3>
                <span className="text-xs text-emerald-400 font-medium">Verifier Flow</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed mb-6">
                Perform instant, gas-free verification. The document is hashed locally in your browser and queried against the on-chain registry without requiring a wallet.
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-400 group-hover:text-emerald-300">
              <span>Go to Verify Flow</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center space-y-2 mb-10">
          <h2 className="text-2xl font-bold text-white">How Verifyd Works</h2>
          <p className="text-sm text-slate-400">
            A three-step cryptographic model designed for enterprise privacy and zero-trust verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-400 text-sm font-bold font-mono">
              01
            </div>
            <h3 className="text-base font-semibold text-white">Local In-Browser SHA-256 Hashing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When you select a document, your browser generates an irreversible 256-bit SHA-256 fingerprint locally. The actual document file is never uploaded, transferred, or stored anywhere.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-400 text-sm font-bold font-mono">
              02
            </div>
            <h3 className="text-base font-semibold text-white">On-Chain Hash Registration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The issuer connects a wallet and records the cryptographic hash along with document classification to the Verifyd smart contract on {BOT_CHAIN_CONFIG.name} (Chain ID {BOT_CHAIN_CONFIG.chainId}).
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 text-sm font-bold font-mono">
              03
            </div>
            <h3 className="text-base font-semibold text-white">Read-Only Verification Against Registry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Any verifier selects a document to re-compute the hash locally. The app queries the smart contract via BOT Chain public RPC: if the hash matches an active record, it is marked VERIFIED; otherwise NOT VERIFIED.
            </p>
          </div>
        </div>
      </section>

      {/* Privacy Architecture Section */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="rounded-2xl border border-indigo-900/40 bg-indigo-950/20 p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
              <Lock className="w-6 h-6" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Badge variant="purple" size="sm">
                  Zero-Knowledge Guarantee
                </Badge>
                <h3 className="text-base font-semibold text-white">
                  Privacy Architecture
                </h3>
              </div>
              <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                The document itself is not uploaded, transferred, or stored by Verifyd. All cryptographic hashing occurs locally within your web browser using SHA-256. Only the irreversible 256-bit hash and document classification are recorded on BOT Chain.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Network Specs Banner */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 sm:p-8 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">
                Built on BOT Chain Mainnet
              </Badge>
              <h3 className="text-lg font-semibold text-white">
                {BOT_CHAIN_CONFIG.name}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Verifyd uses BOT Chain to register and verify document fingerprints. Every document's cryptographic hash is immutably anchored to the smart contract on BOT Chain Mainnet for trustless proof of authenticity.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <a
                href={BOT_CHAIN_CONFIG.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                <span>BOT Chain Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <a
                href={BOT_CHAIN_CONFIG.explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                <span>BOT Chain Mainnet Explorer</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              Chain ID: <span className="text-emerald-400 font-semibold">{BOT_CHAIN_CONFIG.chainId}</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-300">
              Token: <span className="text-indigo-400 font-semibold">{BOT_CHAIN_CONFIG.currencySymbol}</span>
            </div>
            <a
              href={`${BOT_CHAIN_CONFIG.explorerUrl}/address/${BOT_CHAIN_CONFIG.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 transition-colors"
              title={BOT_CHAIN_CONFIG.contractAddress}
            >
              <span>Contract:</span>
              <span className="text-indigo-300 font-semibold">{truncateHash(BOT_CHAIN_CONFIG.contractAddress, 6, 4)}</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
