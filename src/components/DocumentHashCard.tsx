import React, { useState } from 'react';
import { Copy, Check, Hash, Shield } from 'lucide-react';
import { Badge } from './Badge';

interface DocumentHashCardProps {
  rawHex: string;
  bytes32Hex: `0x${string}`;
  fileName?: string;
  isComputing?: boolean;
}

export const DocumentHashCard: React.FC<DocumentHashCardProps> = ({
  rawHex,
  bytes32Hex,
  fileName,
  isComputing = false,
}) => {
  const [copiedRaw, setCopiedRaw] = useState(false);
  const [showPrefix, setShowPrefix] = useState(true);

  const currentHash = showPrefix ? bytes32Hex : rawHex;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentHash);
      setCopiedRaw(true);
      setTimeout(() => setCopiedRaw(false), 2000);
    } catch {
      // Fallback
    }
  };

  if (isComputing) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/60 flex items-center justify-center text-indigo-400">
            <Hash className="w-4 h-4 animate-spin" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-slate-200">
              Generating cryptographic fingerprint...
            </h4>
            <p className="text-xs text-slate-400">Computing SHA-256 digest locally in browser</p>
          </div>
        </div>
      </div>
    );
  }

  if (!rawHex) return null;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 space-y-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-950/80 border border-indigo-700/40 flex items-center justify-center text-indigo-300">
            <Hash className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-slate-200">SHA-256 Document Fingerprint</h4>
              <Badge variant="purple" size="sm">
                256-bit Digest
              </Badge>
            </div>
            {fileName && <p className="text-xs text-slate-400 truncate max-w-sm">{fileName}</p>}
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowPrefix(!showPrefix)}
            className="text-xs px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Toggle between 0x prefix and raw hex format"
          >
            {showPrefix ? 'Format: EVM (0x)' : 'Format: Raw Hex'}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border font-medium transition-all ${
              copiedRaw
                ? 'bg-emerald-950/60 border-emerald-600/60 text-emerald-300'
                : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white'
            }`}
          >
            {copiedRaw ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Hash</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Hash display box */}
      <div className="relative group">
        <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 break-all select-all leading-relaxed">
          {currentHash}
        </div>
      </div>

      <div className="flex items-start gap-2 text-[11px] text-slate-400 bg-slate-950/50 p-3 rounded-xl border border-slate-900">
        <Shield className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
        <p>
          This irreversible cryptographic signature uniquely identifies this file. Even a single changed byte produces a completely different hash.
        </p>
      </div>
    </div>
  );
};
