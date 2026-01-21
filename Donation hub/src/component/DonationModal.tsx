import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Close, AccountBalanceWallet, CheckCircle } from '@mui/icons-material';
import { useWallet } from '../hooks/useWallet';
import { useToast } from '../context/ToastContext';
import TransactionStatusIndicator from './web3/TransactionStatus';
import NetworkSwitcher from './web3/NetworkSwitcher';
import { parseEther } from 'ethers';

// Helper to simulate IPFS upload
const uploadToIPFS = async (metadata: unknown): Promise<string> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("Mock IPFS Upload:", metadata);
      // Generate a mock hash based on timestamp
      const hash = "QmMockHash" + Date.now();
      resolve(`ipfs://${hash}`);
    }, 1000);
  });
};

interface DonationModalProps {
  open: boolean;
  onClose: () => void;
  project: {
    id: number;
    title: string;
    author: string;
    image: string;
  };
}

type DonationStep = 'amount' | 'connecting' | 'uploading' | 'confirming' | 'success' | 'error';

// Contract ABI for donate function
const DONATION_ABI = [
  "function donate(uint256 projectId, string memory tokenURI) external payable"
];

// Deployed contract address (from local deployment)
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

const DonationModal = ({ open, onClose, project }: DonationModalProps) => {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<DonationStep>('amount');
  const [modalError, setModalError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string>('');

  const { connect, account, isConnected, error: walletError, getContract } = useWallet();
  const { showToast } = useToast();

  const proceedToDonation = useCallback(async () => {
    if (!account) {
      setModalError("Wallet not connected correctly");
      setStep('error');
      return;
    }

    try {
      setStep('uploading');

      // 1. Prepare Metadata
      const metadata = {
        name: `Donation Badge - ${project.title}`,
        type: "DonationBadge",
        value: amount, // ETH amount
        hash: `hash_${Date.now()}`, // unique hash
        previousOwners: [],
        createdAt: new Date().toISOString(),
        lastTransferAt: null
      };

      // 2. Upload to IPFS (Simulated)
      const tokenURI = await uploadToIPFS(metadata);
      
      setStep('confirming');

      // 3. Interact with Smart Contract
      const contract = getContract(CONTRACT_ADDRESS, DONATION_ABI);
      if (!contract) throw new Error("Failed to get contract instance");

      const amountInWei = parseEther(amount);
      
      const tx = await contract.donate(project.id, tokenURI, {
        value: amountInWei
      });
      
      setTxHash(tx.hash);
      
      // Wait for transaction to be mined (optional, or let TransactionStatusIndicator handle it if we pass tx object)
      // For now, we set success immediately after send to show the 'confirming' step which uses TransactionStatusIndicator
      // But TransactionStatusIndicator expects a hash and monitors it.
      
      // We'll let the user see the confirming/mining screen
      setStep('confirming'); 
      showToast('Transaction submitted!', 'info');

    } catch (err: unknown) {
      console.error(err);
      setStep('error');
      
      const error = err as { code?: number; info?: { error?: { code?: number } }; reason?: string; message?: string };

      if (error.code === 4001 || (error.info && error.info.error && error.info.error.code === 4001)) {
        setModalError('Transaction rejected by user');
      } else if (error.reason) { // Ethers error reason
         setModalError(error.reason);
      } else {
        setModalError(error.message || 'Failed to process donation');
      }
      showToast('Donation failed', 'error');
    }
  }, [account, amount, getContract, project.id, project.title, showToast]);

  // Sync wallet error to modal error if step is connecting
  useEffect(() => {
    if (walletError && step === 'connecting') {
      setModalError(walletError);
      setStep('error');
      showToast(walletError, 'error');
    }
  }, [walletError, step, showToast]);

  // Handle connection success
  useEffect(() => {
    if (isConnected && step === 'connecting') {
      const timer = setTimeout(() => {
        // After connection, proceed to donation flow (metadata/upload)
        proceedToDonation();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, step, proceedToDonation]);

  const quickAmounts = [0.1, 0.5, 1, 2, 5];

  const handleDonate = async () => {
    const isValidAmount = /^\d*\.?\d+$/.test(amount) && parseFloat(amount) > 0;

    if (!isValidAmount) {
      setModalError('Please enter a valid positive amount');
      return;
    }

    setModalError(null);

    if (!isConnected) {
      setStep('connecting');
      await connect();
    } else {
      await proceedToDonation();
    }
  };

  const handleClose = () => {
    setAmount('');
    setStep('amount');
    setModalError(null);
    setTxHash('');
    onClose();
  };

  const renderContent = () => {
    switch (step) {
      case 'amount':
        return (
          <>
            <DialogContent>
              {/* Project Info */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  mb: 3,
                  p: 2,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                }}
              >
                <NetworkSwitcher variant="default" showWarning={true} requiredChainId={31337} /> {/* Hardhat Local */}
                <Box sx={{ mt: 2 }} />
                <Box
                  component="img"
                  src={project.image}
                  alt={project.title}
                  sx={{
                    width: 60,
                    height: 60,
                    borderRadius: 1,
                    objectFit: 'cover',
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body1" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {project.title}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    By {project.author}
                  </Typography>
                </Box>
              </Box>

              {modalError && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {modalError}
                </Alert>
              )}

              {/* Amount Input */}
              <Typography variant="body2" sx={{ fontWeight: 600, mb: 1.5 }}>
                Enter donation amount (ETH)
              </Typography>
              <TextField
                fullWidth
                placeholder="0.00"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setModalError(null);
                }}
                type="number"
                inputProps={{ step: '0.01', min: '0', 'aria-label': 'Donation amount' }}
                sx={{
                  mb: 2,
                  '& .MuiOutlinedInput-root': {
                    fontWeight: 600,
                    fontSize: '1.25rem',
                  },
                }}
              />

              {/* Quick Amount Buttons */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {quickAmounts.map((quickAmount) => (
                  <Button
                    key={quickAmount}
                    variant="outlined"
                    size="small"
                    onClick={() => {
                      setAmount(String(quickAmount));
                      setModalError(null);
                    }}
                    sx={{
                      borderColor: 'divider',
                      color: 'text.primary',
                      '&:hover': {
                        borderColor: 'primary.main',
                        bgcolor: 'rgba(103, 100, 242, 0.08)',
                      },
                    }}
                  >
                    {quickAmount} ETH
                  </Button>
                ))}
              </Box>

              <Divider sx={{ my: 2 }} />

              {/* Fee Info */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Your donation
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {amount || '0.00'} ETH
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                  Platform fee (0%)
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  0.00 ETH
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  Total
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {amount || '0.00'} ETH
                </Typography>
              </Box>

              <Alert severity="info" sx={{ mt: 3 }}>
                Network fees (gas) will be calculated by MetaMask
              </Alert>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={handleDonate}
                startIcon={<AccountBalanceWallet />}
                disabled={!amount || parseFloat(amount) <= 0}
                sx={{ px: 4 }}
              >
                Donate Now
              </Button>
            </DialogActions>
          </>
        );

      case 'connecting':
        return (
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Connecting to MetaMask
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Please wait while we connect to your wallet...
              </Typography>
            </Box>
          </DialogContent>
        );
      
      case 'uploading':
        return (
          <DialogContent>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress size={60} sx={{ mb: 3 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Uploading to IPFS
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Generating badge metadata and uploading...
              </Typography>
            </Box>
          </DialogContent>
        );

      case 'confirming':
        return (
          <DialogContent>
            {txHash ? (
              <TransactionStatusIndicator
                txHash={txHash}
                chainId={31337} // Hardhat Local
                onSuccess={() => setStep('success')}
                onError={() => {
                  setStep('error');
                  setModalError('Transaction failed on-chain');
                }}
              />
            ) : (
               <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={60} sx={{ mb: 3 }} />
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                  Confirm Transaction
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                  Please confirm the transaction in MetaMask
                </Typography>
                <Box
                  sx={{
                    p: 2,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    display: 'inline-block',
                  }}
                >
                  <Typography variant="h4" sx={{ fontWeight: 700, color: 'primary.main' }}>
                    {amount} ETH
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
        );

      case 'success':
        return (
          <>
            <DialogContent>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CheckCircle sx={{ fontSize: 80, color: 'success.main', mb: 3 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  Donation Successful!
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                  Thank you for supporting {project.title}
                </Typography>

                <Box
                  sx={{
                    p: 3,
                    bgcolor: 'background.default',
                    borderRadius: 2,
                    textAlign: 'left',
                  }}
                >
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    Amount donated
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: 'primary.main' }}>
                    {amount} ETH
                  </Typography>

                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                    Transaction Hash
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      fontFamily: 'monospace',
                      wordBreak: 'break-all',
                      color: 'text.primary',
                    }}
                  >
                    {txHash}
                  </Typography>
                </Box>

                <Alert severity="success" sx={{ mt: 3, textAlign: 'left' }}>
                  Your donation will appear in your dashboard shortly
                </Alert>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button variant="contained" onClick={handleClose} fullWidth>
                Close
              </Button>
            </DialogActions>
          </>
        );

      case 'error':
        return (
          <>
            <DialogContent>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Close sx={{ fontSize: 80, color: 'error.main', mb: 3 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                  Transaction Failed
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
                  {modalError || 'Something went wrong with your donation'}
                </Typography>

                <Alert severity="error">
                  {modalError || 'Please try again or contact support'}
                </Alert>
              </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 3 }}>
              <Button onClick={handleClose} sx={{ color: 'text.secondary' }}>
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={() => {
                  setStep('amount');
                  setModalError(null);
                }}
              >
                Try Again
              </Button>
            </DialogActions>
          </>
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={step === 'success' ? handleClose : () => { }}
      maxWidth="sm"
      fullWidth
      aria-labelledby="donation-dialog-title"
      PaperProps={{
        sx: {
          borderRadius: 2,
        },
      }}
    >
      <DialogTitle
        id="donation-dialog-title"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          pb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {step === 'success' ? 'Success!' : 'Make a Donation'}
        </Typography>
        {(step === 'amount' || step === 'success') && (
          <IconButton onClick={handleClose} size="small" aria-label="close modal">
            <Close />
          </IconButton>
        )}
      </DialogTitle>

      {renderContent()}
    </Dialog>
  );
};

export default DonationModal;
