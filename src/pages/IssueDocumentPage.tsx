import React, { useState } from 'react';
import {
  FilePlus2,
  ArrowLeft,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  RotateCcw,
  ShieldCheck,
  Search,
  Wallet,
  ArrowRightLeft,
} from 'lucide-react';
import { FileUpload } from '../components/FileUpload';
import { DocumentHashCard } from '../components/DocumentHashCard';
import { Badge } from '../components/Badge';
import { Button } from '../components/Button';
import { calculateFileSha256 } from '../utils/crypto';
import { truncateHash } from '../utils/formatters';
import { DOCUMENT_TYPES, type DocumentCategory, type ActivePage } from '../types/document';
import { BOT_CHAIN_CONFIG } from '../lib/botchain';
import { useWallet } from '../hooks/useWallet';
import {
  checkDocumentExists,
  registerDocumentOnChain,
  waitForRegistrationConfirmation,
} from '../lib/verifydService';

interface IssueDocumentPageProps {
  onNavigate: (page: ActivePage) => void;
}

interface RegistrationSuccessData {
  documentHash: `0x${string}`;
  documentType: string;
  issuer: `0x${string}`;
  txHash: `0x${string}`;
  fileName: string;
}

export const IssueDocumentPage: React.FC<IssueDocumentPageProps> = ({ onNavigate }) => {
  const {
    address,
    isConnected,
    isCorrectNetwork,
    walletClient,
    connectWallet,
    switchToBohrTestnet,
  } = useWallet();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory>('certificate');
  const [isComputingHash, setIsComputingHash] = useState(false);
  const [rawHash, setRawHash] = useState<string>('');
  const [bytes32Hash, setBytes32Hash] = useState<`0x${string}`>('0x');

  // On-chain check and submission states
  const [isCheckingExists, setIsCheckingExists] = useState(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [registrationSuccess, setRegistrationSuccess] = useState<RegistrationSuccessData | null>(null);
  const [copiedTx, setCopiedTx] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  // File selection & local hash computation
  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsComputingHash(true);
    setSubmitError(null);
    setRegistrationSuccess(null);
    setIsAlreadyRegistered(false);

    try {
      // 1. Pure client-side hashing
      const { rawHex, bytes32Hex } = await calculateFileSha256(file);
      setRawHash(rawHex);
      setBytes32Hash(bytes32Hex);
      setIsComputingHash(false);

      // 2. Read-only pre-flight check on BOT Chain Bohr Testnet
      setIsCheckingExists(true);
      try {
        const exists = await checkDocumentExists(bytes32Hex);
        setIsAlreadyRegistered(exists);
      } catch (readErr) {
        console.warn('Pre-flight documentExists check failed:', readErr);
      } finally {
        setIsCheckingExists(false);
      }
    } catch (err) {
      console.error('Failed to calculate SHA-256:', err);
      setSubmitError('Failed to read or calculate hash for the selected file.');
      setIsComputingHash(false);
    }
  };

  const handleClear = () => {
    setSelectedFile(null);
    setRawHash('');
    setBytes32Hash('0x');
    setIsAlreadyRegistered(false);
    setIsCheckingExists(false);
    setSubmitError(null);
    setRegistrationSuccess(null);
  };

  // Explicit registration action triggered ONLY by user button click
  const handleRegister = async () => {
    if (!selectedFile || !bytes32Hash || bytes32Hash === '0x') {
      setSubmitError('Please upload a document to calculate its cryptographic fingerprint.');
      return;
    }

    if (!selectedCategory) {
      setSubmitError('Please select a document classification.');
      return;
    }

    if (!isConnected || !address || !walletClient) {
      setSubmitError('Wallet is not connected. Please connect your MetaMask wallet.');
      return;
    }

    if (!isCorrectNetwork) {
      setSubmitError(
        `Wrong network. Please switch to ${BOT_CHAIN_CONFIG.name} (Chain ID ${BOT_CHAIN_CONFIG.chainId}).`
      );
      return;
    }

    setSubmitError(null);
    setIsSubmitting(true);

    try {
      // Verify duplicate one last time before broadcasting
      const alreadyExists = await checkDocumentExists(bytes32Hash);
      if (alreadyExists) {
        setIsAlreadyRegistered(true);
        setSubmitError(
          `This document has already been registered on ${BOT_CHAIN_CONFIG.name}. Duplicate registrations are prohibited.`
        );
        setIsSubmitting(false);
        return;
      }

      // Request transaction signature via MetaMask
      const txHash = await registerDocumentOnChain(
        walletClient,
        address,
        bytes32Hash,
        selectedCategory
      );

      // Wait for block confirmation on Bohr Testnet
      setIsConfirming(true);
      const receipt = await waitForRegistrationConfirmation(txHash);

      if (receipt.status === 'success' || (receipt.status as any) === 1) {
        setRegistrationSuccess({
          documentHash: bytes32Hash,
          documentType: selectedCategory,
          issuer: address,
          txHash,
          fileName: selectedFile.name,
        });
        setIsAlreadyRegistered(true);
      } else {
        setSubmitError('Transaction was reverted on-chain. Please check your account and gas balance.');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      if (err?.code === 4001 || err?.message?.includes('rejected')) {
        setSubmitError('Transaction was rejected in your wallet.');
      } else if (
        err?.message?.includes('DocumentAlreadyRegistered') ||
        err?.data?.errorName === 'DocumentAlreadyRegistered'
      ) {
        setIsAlreadyRegistered(true);
        setSubmitError('This document hash is already registered on BOT Chain.');
      } else if (err?.message?.includes('insufficient funds')) {
        setSubmitError('Insufficient BOT balance to cover gas fees for registration.');
      } else {
        setSubmitError(
          err?.shortMessage || err?.message || 'Transaction submission failed. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
      setIsConfirming(false);
    }
  };

  const handleCopyTx = async () => {
    if (!registrationSuccess) return;
    try {
      await navigator.clipboard.writeText(registrationSuccess.txHash);
      setCopiedTx(true);
      setTimeout(() => setCopiedTx(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleCopyDocHash = async () => {
    if (!registrationSuccess) return;
    try {
      await navigator.clipboard.writeText(registrationSuccess.documentHash);
      setCopiedHash(true);
      setTimeout(() => setCopiedHash(false), 2000);
    } catch {
      // Fallback
    }
  };

  const selectedCategoryLabel =
    DOCUMENT_TYPES.find((d) => d.id === selectedCategory)?.label || selectedCategory;

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
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Issue Document</h1>
              <p className="text-xs text-slate-400">
                Compute a cryptographic SHA-256 fingerprint locally and register it on {BOT_CHAIN_CONFIG.name}
              </p>
            </div>
          </div>
        </div>

        <Badge variant="purple" size="md">
          Issuer Flow
        </Badge>
      </div>

      {/* Success State View */}
      {registrationSuccess ? (
        <section className="rounded-2xl border border-emerald-500/40 bg-emerald-950/20 p-6 sm:p-8 space-y-6 shadow-xl shadow-emerald-950/30">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white">Document Registered Successfully!</h2>
                <Badge variant="success" size="sm">
                  Confirmed On-Chain
                </Badge>
              </div>
              <p className="text-xs text-emerald-300/80 mt-0.5">
                The cryptographic fingerprint is permanently anchored to {BOT_CHAIN_CONFIG.name}.
              </p>
            </div>
          </div>

          {/* Details Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-semibold">
                Original File
              </span>
              <p className="text-white font-medium truncate">{registrationSuccess.fileName}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-semibold">
                Document Classification
              </span>
              <p className="text-white font-medium">{selectedCategoryLabel}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-semibold">
                  SHA-256 Document Fingerprint (bytes32)
                </span>
                <button
                  type="button"
                  onClick={handleCopyDocHash}
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <p className="font-mono text-indigo-300 break-all select-all">
                {registrationSuccess.documentHash}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-semibold">
                Issuer Wallet
              </span>
              <div className="flex items-center justify-between">
                <p className="font-mono text-slate-200">
                  {truncateHash(registrationSuccess.issuer, 8, 6)}
                </p>
                <a
                  href={`${BOT_CHAIN_CONFIG.explorerUrl}/address/${registrationSuccess.issuer}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  <span>Explorer</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-[11px] uppercase tracking-wider block font-semibold">
                  Transaction Hash
                </span>
                <button
                  type="button"
                  onClick={handleCopyTx}
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                >
                  {copiedTx ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedTx ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="flex items-center justify-between">
                <p className="font-mono text-slate-200">
                  {truncateHash(registrationSuccess.txHash, 8, 6)}
                </p>
                <a
                  href={`${BOT_CHAIN_CONFIG.explorerUrl}/tx/${registrationSuccess.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300"
                >
                  <span>View Tx</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          {/* Success Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-emerald-900/40">
            <Button
              variant="outline"
              onClick={handleClear}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Issue Another Document
            </Button>
            <Button
              variant="primary"
              onClick={() => onNavigate('verify')}
              leftIcon={<Search className="w-4 h-4" />}
            >
              Verify This Document
            </Button>
          </div>
        </section>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {/* Step 1: Upload Document */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-mono">
                  1
                </span>
                Upload Original Document
              </label>
              <span className="text-xs text-slate-400">Processed locally in browser • Never uploaded</span>
            </div>

            <FileUpload
              selectedFile={selectedFile}
              onFileSelect={handleFileSelect}
              onClear={handleClear}
              disabled={isSubmitting || isConfirming}
              title="Drop the document to issue"
              subtitle="Degree, certification, deed, contract, invoice, or legal statement"
            />
          </section>

          {/* Step 2: Document Classification */}
          <section className="space-y-4">
            <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-mono">
                2
              </span>
              Select Document Classification
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {DOCUMENT_TYPES.map((type) => {
                const isSelected = selectedCategory === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setSelectedCategory(type.id)}
                    disabled={isSubmitting || isConfirming}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-950/40 text-white shadow-sm ring-1 ring-indigo-500/50'
                        : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 text-slate-300 hover:bg-slate-900/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{type.label}</span>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 leading-normal line-clamp-2">
                      {type.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Step 3: Generated SHA-256 Fingerprint */}
          {selectedFile && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-xs flex items-center justify-center font-mono">
                    3
                  </span>
                  Calculated Fingerprint (SHA-256)
                </label>
                {isCheckingExists && (
                  <span className="text-xs text-slate-400">Checking on-chain registry...</span>
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

          {/* Duplicate Document Warning */}
          {isAlreadyRegistered && (
            <section className="rounded-2xl border border-amber-600/40 bg-amber-950/20 p-5 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-sm font-semibold text-amber-200">
                    Document Already Registered on BOT Chain
                  </h4>
                  <p className="text-xs text-amber-300/80 leading-relaxed">
                    This exact file's cryptographic hash already exists in the Verifyd smart contract on {BOT_CHAIN_CONFIG.name}.
                    Duplicate registrations are not permitted.
                  </p>
                </div>
              </div>
              <div className="pt-2 flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigate('verify')}
                  leftIcon={<Search className="w-3.5 h-3.5" />}
                >
                  Verify Document Instead
                </Button>
              </div>
            </section>
          )}

          {/* Wallet State Callout */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700/80 flex items-center justify-center text-slate-300 shrink-0">
                  <ShieldCheck className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">
                    Target Network: {BOT_CHAIN_CONFIG.name} (Chain ID {BOT_CHAIN_CONFIG.chainId})
                  </h4>
                  <p className="text-xs text-slate-400">
                    Registration submits a transaction calling{' '}
                    <code className="text-slate-300 font-mono">registerDocument(bytes32,string)</code>
                  </p>
                </div>
              </div>

              {!isConnected ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={connectWallet}
                  leftIcon={<Wallet className="w-3.5 h-3.5" />}
                >
                  Connect Wallet
                </Button>
              ) : !isCorrectNetwork ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={switchToBohrTestnet}
                  leftIcon={<ArrowRightLeft className="w-3.5 h-3.5" />}
                >
                  Switch Network
                </Button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs text-slate-300 font-mono">
                    {truncateHash(address || '', 6, 4)}
                  </span>
                </div>
              )}
            </div>
          </section>

          {/* Submission Error Display */}
          {submitError && (
            <div className="p-4 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="font-semibold block text-rose-300">Registration Failed</span>
                <p>{submitError}</p>
              </div>
            </div>
          )}

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <Button
              variant="outline"
              onClick={handleClear}
              disabled={!selectedFile || isSubmitting || isConfirming}
            >
              Reset Form
            </Button>

            {!isConnected ? (
              <Button
                variant="primary"
                onClick={connectWallet}
                leftIcon={<Wallet className="w-4 h-4" />}
              >
                Connect Wallet to Register
              </Button>
            ) : !isCorrectNetwork ? (
              <Button
                variant="primary"
                onClick={switchToBohrTestnet}
                leftIcon={<ArrowRightLeft className="w-4 h-4" />}
              >
                Switch to {BOT_CHAIN_CONFIG.shortName} ({BOT_CHAIN_CONFIG.chainId})
              </Button>
            ) : isAlreadyRegistered ? (
              <Button
                variant="secondary"
                disabled
                title="This document is already registered on BOT Chain"
              >
                Already Registered
              </Button>
            ) : (
              <Button
                variant="primary"
                disabled={!selectedFile || isComputingHash || isSubmitting || isConfirming}
                isLoading={isSubmitting || isConfirming}
                onClick={handleRegister}
                rightIcon={<Layers className="w-4 h-4" />}
              >
                {isConfirming
                  ? 'Confirming Transaction...'
                  : isSubmitting
                  ? 'Confirm in MetaMask...'
                  : 'Register on BOT Chain'}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
