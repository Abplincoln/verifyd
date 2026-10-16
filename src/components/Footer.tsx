import React from 'react';
import { ShieldCheck, Lock, Cpu, ExternalLink } from 'lucide-react';
import { BOT_CHAIN_CONFIG } from '../lib/botchain';

const CURRENT_YEAR = new Date().getFullYear();

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-slate-900 bg-slate-950 text-slate-400 py-12 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-semibold text-white tracking-tight">Verifyd</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Cryptographic document integrity anchored to {BOT_CHAIN_CONFIG.name}. Verify what you can prove, without exposing confidential data.
            </p>
          </div>

          {/* Privacy & Architecture Guarantee */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-indigo-400" />
              Privacy Architecture
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your files never leave your browser. Verifyd computes a local 256-bit SHA-256 cryptographic digest. Only the irreversible hash is recorded on-chain; the document itself is never uploaded or stored.
            </p>
          </div>

          {/* Network details */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              Blockchain Network
            </h4>
            <ul className="text-xs space-y-1.5 text-slate-400">
              <li>
                Network:{' '}
                <span className="text-slate-200 font-medium">{BOT_CHAIN_CONFIG.name}</span>
              </li>
              <li>
                Chain ID: <code className="text-slate-300 font-mono">{BOT_CHAIN_CONFIG.chainId}</code>
              </li>
              <li>
                Native Currency:{' '}
                <span className="text-slate-200 font-medium">{BOT_CHAIN_CONFIG.currencySymbol}</span>
              </li>
              <li>
                <a
                  href={BOT_CHAIN_CONFIG.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 underline"
                >
                  {BOT_CHAIN_CONFIG.explorerName} <ExternalLink className="w-3 h-3" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {CURRENT_YEAR} Verifyd. All rights reserved.</p>
          <p className="text-slate-400">
            Verify what you can prove.
          </p>
        </div>
      </div>
    </footer>
  );
};
