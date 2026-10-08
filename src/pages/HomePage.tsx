import React from 'react';
import {
  FilePlus2,
  FileCheck2,
  ArrowRight,
  ExternalLink,
  Fingerprint,
} from 'lucide-react';
import type { ActivePage } from '../types/document';
import { BOT_CHAIN_CONFIG } from '../lib/botchain';
import { Badge } from '../components/Badge';

interface HomePageProps {
  onNavigate: (page: ActivePage) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="text-center space-y-6 max-w-4xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/60 border border-indigo-700/50 text-indigo-300 text-xs font-medium">
          <Fingerprint className="w-3.5 h-3.5 text-indigo-400" />
          <span>Blockchain-Powered Document Integrity</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.15]">
          Verify what you can <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-indigo-200 to-emerald-300">prove</span>.
        </h1>

        <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Verifyd anchors cryptographic fingerprints of documents to the BOT Chain Bohr Testnet. Anyone can verify document authenticity in seconds without exposing confidential contents.
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
                Upload a diploma, certificate, or contract. Generate a cryptographic SHA-256 fingerprint ready to anchor permanently on BOT Chain.
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
                Drop any document to calculate its fingerprint and cross-check directly against the blockchain registry to confirm if it is authentic.
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
            <h3 className="text-base font-semibold text-white">Local In-Browser Hashing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              When you select a document, your browser generates a standard SHA-256 fingerprint. The actual document file is never transmitted or saved anywhere.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-700/50 flex items-center justify-center text-indigo-400 text-sm font-bold font-mono">
              02
            </div>
            <h3 className="text-base font-semibold text-white">BOT Chain Registration</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              The issuer submits the 256-bit cryptographic digest to the Verifyd smart contract on BOT Chain Bohr Testnet (Chain ID 968) using their wallet.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950 border border-emerald-700/50 flex items-center justify-center text-emerald-400 text-sm font-bold font-mono">
              03
            </div>
            <h3 className="text-base font-semibold text-white">Trustless Verification</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Any verifier uploads the file to re-calculate the hash. The app queries the smart contract: if the hash matches, it is marked VERIFIED; otherwise NOT VERIFIED.
            </p>
          </div>
        </div>
      </section>

      {/* Network Specs Banner */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">
                Target Network
              </Badge>
              <h3 className="text-base font-semibold text-white">
                BOT Chain Bohr Testnet
              </h3>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              Verification smart contract transactions operate on Bohr Testnet. Native gas token: BOT.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs font-mono">
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              Chain ID: <span className="text-emerald-400 font-semibold">{BOT_CHAIN_CONFIG.chainId}</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300">
              Token: <span className="text-indigo-400 font-semibold">{BOT_CHAIN_CONFIG.currencySymbol}</span>
            </div>
            <a
              href={BOT_CHAIN_CONFIG.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
            >
              <span>Explorer</span>
              <ExternalLink className="w-3 h-3 text-slate-400" />
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};
