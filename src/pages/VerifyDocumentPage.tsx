import React, { useState } from 'react';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Search,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  FilePlus2,
  Calendar,
  User,
  Hash,
  FileText,
} from 'lucide-react';
import { FileUpload } from '../components/FileUpload';
import { DocumentHashCard } from '../components/DocumentHashCard';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { calculateFileSha256 } from '../utils/crypto';
import { formatDateTime, truncateHash } from '../utils/formatters';
import { DOCUMENT_TYPES, type ActivePage, type RegisteredDocument } from '../types/document';
import { BOT_CHAIN_CONFIG } from '../lib/botchain';
import { checkDocumentExists, getRegisteredDocument } from '../lib/verifydService';

interface VerifyDocumentPageProps {
  onNavigate: (page: ActivePage) => void;
}

interface VerificationResult {
  verified: boolean;
  document: RegisteredDocument | null;
}

export const VerifyDocumentPage: React.FC<VerifyDocumentPageProps> = ({ onNavigate }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isComputingHash, setIsComputingHash] = useState(false);
  const [rawHash, setRawHash] = useState<string>('');
  const [bytes32Hash, setBytes32Hash] = useState<`0x${string}`>('0x');

  // Read-only on-chain verification state
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [copiedHash, setCopiedHash] = useState(false);

  // Perform public read-only verification
  const verifyOnChain = async (hash: `0x${string}`) => {
    setIsVerifying(true);
    setVerificationError(null);
    setVerificationResult(null);

    try {
      // 1. Call documentExists(bytes32) via public RPC client
      const exists = await checkDocumentExists(hash);

      if (!exists) {
        setVerificationResult({
          verified: false,
          document: null,
        });
      } else {
        // 2. Call getDocument(bytes32) to retrieve registration record
        const docRecord = await getRegisteredDocument(hash);
        setVerificationResult({
          verified: true,
          document: docRecord,
        });
      }
    } catch (err: any) {
      console.error('Verification query failed:', err);
      setVerificationError(
        `Unable to query ${BOT_CHAIN_CONFIG.name} RPC. Please verify your internet connection or try again.`
      );
    } finally {
      setIsVerifying(false);
    }
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsComputingHash(true);
    setVerificationError(null);
    setVerificationResult(null);

    try {
      // Pure in-browser hashing
      const { rawHex, bytes32Hex } = await calculateFileSha256(file);
      setRawHash(rawHex);
      setBytes32Hash(bytes32Hex);
      setIsComputingHash(false);

      // Immediately execute public read-only verification query
      await verifyOnChain(bytes32Hex);
    } catch (err) {
      console.error('Failed to calculate SHA-256:', err);
      setVerificationError('Failed to read or calculate hash for the uploaded file.');
      setIsComputingHash(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setRawHash('');
    setBytes32Hash('0x');
    setVerificationResult(null);
    setVerificationError(null);
    setIsVerifying(false);
  };

  const handleCopyHash = async () => {
    if (!bytes32Hash || bytes32Hash === '0x') return;
    try {
      await navigator.clipboard.writeText(bytes32Hash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } catch {
      // Fallback
    }
  };

  const getDocTypeLabel = (category: string) => {
    return DOCUMENT_TYPES.find((d) => d.id === category)?.label || category;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Verify Document</h1>
              <p className="text-xs text-slate-400">
                Public, gas-free document authenticity check powered by {BOT_CHAIN_CONFIG.name}
              </p>
            </div>
          </div>
        </div>

        <Badge variant="success" size="md">
          Public Verifier Flow
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Step 1: Upload Document */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-mono">
                1
              </span>
              Upload Document to Verify
            </label>
            <span className="text-xs text-slate-400">Read locally in browser • No wallet required</span>
          </div>

          <FileUpload
            selectedFile={selectedFile}
            onFileSelect={handleFileSelect}
            onClear={handleClear}
            disabled={isComputingHash || isVerifying}
            title="Drop the document to verify"
            subtitle="Any copy of the original document to check for authenticity and tampering"
          />
        </section>

        {/* Step 2: Generated Fingerprint */}
        {selectedFile && (
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-mono">
                  2
                </span>
                Computed Fingerprint (SHA-256)
              </label>
              {isVerifying && (
                <span className="text-xs text-indigo-400 animate-pulse">
                  Checking BOT Chain registry...
                </span>
              )}
            </div>

            <DocumentHashCard
              rawHex={rawHash}
              bytes32Hex={bytes32Hash}
              fileName={selectedFile.name}
              isComputing={isComputingHash}
            />
          </section>
        )}

        {/* Step 3: Verification Result */}
        {selectedFile && !isComputingHash && (
          <section className="space-y-4">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-mono">
                3
              </span>
              Verification Outcome
            </label>

            {/* In-Flight Querying State */}
            {isVerifying && (
              <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-700/50 flex items-center justify-center text-indigo-400 shrink-0">
                  <Search className="w-5 h-5 animate-spin" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-slate-200">
                    Querying {BOT_CHAIN_CONFIG.name}...
                  </h4>
                  <p className="text-xs text-slate-400">
                    Calling <code className="text-slate-300 font-mono">documentExists</code> via public RPC. No wallet signature or gas required.
                  </p>
                </div>
              </div>
            )}

            {/* Error State */}
            {verificationError && !isVerifying && (
              <div className="p-5 rounded-2xl bg-rose-950/50 border border-rose-800/80 text-rose-200 text-xs space-y-3">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-semibold block text-rose-300 text-sm">
                      Verification Query Failed
                    </span>
                    <p>{verificationError}</p>
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => verifyOnChain(bytes32Hash)}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Retry Verification
                  </Button>
                </div>
              </div>
            )}

            {/* VERIFIED State Card */}
            {verificationResult?.verified && verificationResult.document && !isVerifying && (
              <div className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 sm:p-8 space-y-6 shadow-xl shadow-emerald-950/25">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-white tracking-tight">VERIFIED</h2>
                        <Badge variant="success" size="sm">
                          Authentic Document
                        </Badge>
                      </div>
                      <p className="text-xs text-emerald-300/80 mt-0.5">
                        This document fingerprint matches an active cryptographic registration on BOT Chain.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Verified Metadata Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                      <span>Document Classification</span>
                    </div>
                    <p className="text-white font-medium text-sm">
                      {getDocTypeLabel(verificationResult.document.documentType)}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Registration Timestamp</span>
                    </div>
                    <p className="text-white font-medium text-sm">
                      {formatDateTime(Number(verificationResult.document.timestamp) * 1000)}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                        <Hash className="w-3.5 h-3.5 text-slate-400" />
                        <span>Registered SHA-256 Digest (bytes32)</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleCopyHash}
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      >
                        {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="font-mono text-indigo-300 break-all select-all text-xs">
                      {verificationResult.document.documentHash}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Issuer Wallet Address</span>
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="font-mono text-slate-200">
                        {truncateHash(verificationResult.document.issuer, 8, 6)}
                      </span>
                      <a
                        href={`${BOT_CHAIN_CONFIG.explorerUrl}/address/${verificationResult.document.issuer}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                      >
                        <span>View on Explorer</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Registry Smart Contract</span>
                    </div>
                    <div className="flex items-center justify-between pt-0.5">
                      <span className="font-mono text-slate-200">
                        {truncateHash(BOT_CHAIN_CONFIG.contractAddress, 8, 6)}
                      </span>
                      <a
                        href={`${BOT_CHAIN_CONFIG.explorerUrl}/address/${BOT_CHAIN_CONFIG.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                      >
                        <span>Registry Contract</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                {/* Assurance Notice */}
                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-emerald-900/40 text-xs text-emerald-200/90 flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    100% Cryptographic Match. The uploaded file is bit-for-bit identical to the document registered on {BOT_CHAIN_CONFIG.name}.
                  </p>
                </div>
              </div>
            )}

            {/* NOT VERIFIED State Card */}
            {verificationResult && !verificationResult.verified && !isVerifying && (
              <div className="rounded-2xl border border-rose-500/40 bg-rose-950/20 p-6 sm:p-8 space-y-6 shadow-xl shadow-rose-950/25">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shrink-0">
                      <XCircle className="w-7 h-7" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-white tracking-tight">NOT VERIFIED</h2>
                        <Badge variant="danger" size="sm">
                          No Record Found
                        </Badge>
                      </div>
                      <p className="text-xs text-rose-300/80 mt-0.5">
                        No matching cryptographic fingerprint was found on {BOT_CHAIN_CONFIG.name} for this exact file.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-950/80 border border-rose-900/30 text-xs text-slate-300 space-y-2">
                  <p className="font-semibold text-rose-300">Why was this document not verified?</p>
                  <ul className="list-disc list-inside text-slate-400 space-y-1 text-[11px] leading-relaxed">
                    <li>This document has never been issued or registered on {BOT_CHAIN_CONFIG.name}.</li>
                    <li>
                      The document has been modified, edited, re-compressed, or cropped since issuance. Even a 1-byte alteration creates an entirely different SHA-256 fingerprint.
                    </li>
                    <li>The document was issued on another network.</li>
                  </ul>
                </div>

                {/* Direct Action to Issue */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-rose-900/30">
                  <span className="text-xs text-slate-400">
                    Are you the issuer of this document?
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onNavigate('issue')}
                    leftIcon={<FilePlus2 className="w-3.5 h-3.5" />}
                  >
                    Issue This Document
                  </Button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Read-Only Guarantee Callout */}
        <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-emerald-200">
                Public Read-Only Verification
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Verification queries the public RPC at{' '}
                <code className="text-slate-300 font-mono">{BOT_CHAIN_CONFIG.rpcUrl}</code>. You do not need to connect MetaMask or spend any gas to verify document authenticity.
              </p>
            </div>
          </div>
        </section>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
          <Button
            variant="outline"
            onClick={handleClear}
            disabled={!selectedFile || isVerifying}
          >
            Clear Document
          </Button>

          {selectedFile && bytes32Hash && bytes32Hash !== '0x' && (
            <Button
              variant="secondary"
              disabled={isVerifying}
              isLoading={isVerifying}
              onClick={() => verifyOnChain(bytes32Hash)}
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              Re-check Contract
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
