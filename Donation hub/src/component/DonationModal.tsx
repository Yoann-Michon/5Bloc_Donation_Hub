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
  Tooltip,
} from '@mui/material';
import { Close, AccountBalanceWallet, CheckCircle } from '@mui/icons-material';
import { useWallet } from '../hooks/useWallet';
import { useToast } from '../context/ToastContext';
import TransactionStatusIndicator from './web3/TransactionStatus';
import NetworkSwitcher from './web3/NetworkSwitcher';
import { parseEther } from 'ethers';
import { createDonation } from '../utils/api';

const PINATA_JWT = import.meta.env.VITE_PINATA_JWT;

const uploadToIPFS = async (metadata: any): Promise<string> => {
  try {
    if (PINATA_JWT && PINATA_JWT !== 'your_pinata_jwt_here') {
      const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${PINATA_JWT}`
        },
        body: JSON.stringify({
          pinataContent: metadata,
          pinataMetadata: {
            name: metadata.name
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Pinata upload failed: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      localStorage.setItem(data.IpfsHash, JSON.stringify(metadata));

      return `ipfs://${data.IpfsHash}`;
    } else {
      console.warn('⚠️ Pinata JWT not configured. Using local metadata storage.');

      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 15);
      const localHash = `local-${timestamp}-${randomId}`;

      localStorage.setItem(localHash, JSON.stringify(metadata));

      return `local://${localHash}`;
    }
  } catch (error) {
    throw error;
  }
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



const DonationModal = ({ open, onClose, project }: DonationModalProps) => {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<DonationStep>('amount');
  const [modalError, setModalError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string>('');

  const { connect, account, isConnected, error: walletError, getBadgeContract } = useWallet();
  const { showToast } = useToast();

  const DEFAULT_IMAGES = {
    Bronze: 'https://img.freepik.com/vecteurs-premium/medaille-bronze-realiste-rubans-rouges-coupe-du-gagnant-gravee-badge-premium-pour-gagnants-realisations_88188-4035.jpg',
    Silver: 'https://img.freepik.com/vecteurs-premium/medaille-argent-realiste-rubans-rouges-coupe-du-gagnant-gravee-badge-premium-pour-gagnants-realisations_88188-4037.jpg',
    Gold: 'https://img.freepik.com/vecteurs-premium/medaille-or-realiste-rubans-rouges-coupe-du-vainqueur-gravee-badge-premium-pour-gagnants-realisations_88188-4043.jpg?w=996',
    Diamond: 'https://placehold.co/200/00E5FF/FFFFFF/png?text=Diamond+Badge',
    Unknown: 'https://placehold.co/200/808080/FFFFFF/png?text=Badge'
  };
  const proceedToDonation = useCallback(async () => {
    if (!account) {
      setModalError("Wallet not connected correctly");
      setStep('error');
      return;
    }

    try {
      const contract = getBadgeContract();
      if (!contract) throw new Error("Contract not initialized. Please checking wallet connection.");

      try {
        const balance = await contract.balanceOf(account);
        if (Number(balance) >= 4) {
          throw new Error("Limite de 4 badges atteinte");
        }
      } catch (e: any) {
        if (e.message.includes("Limite de 4 badges atteinte")) throw e;

      }


      const lastAction = await contract.lastActionTimestamp(account);
      const lastActionDate = new Date(Number(lastAction) * 1000);
      const now = new Date();

      const diffMs = now.getTime() - lastActionDate.getTime();
      const diffMinutes = diffMs / 1000 / 60;

      if (Number(lastAction) > 0 && diffMinutes < 5) {
        throw new Error(`Cooldown de 5 minutes actif`);
      }

      setStep('uploading');

      const amountVal = parseFloat(amount);
      let type: "Bronze" | "Silver" | "Gold" | "Diamond" | "Unknown" = "Unknown";
      let imageUrl = DEFAULT_IMAGES.Unknown;

      if (amountVal < 6.0) {
        type = "Bronze";
        imageUrl = DEFAULT_IMAGES.Bronze;
      } else if (amountVal >= 6.0 && amountVal < 11.0) {
        type = "Silver";
        imageUrl = DEFAULT_IMAGES.Silver;
      } else if (amountVal >= 11.0 && amountVal < 21.0) {
        type = "Gold";
        imageUrl = DEFAULT_IMAGES.Gold;
      } else if (amountVal >= 21.0) {
        type = "Diamond";
        imageUrl = DEFAULT_IMAGES.Unknown; // User will provide or keep placeholder
      }

      const nowTimestamp = Math.floor(Date.now() / 1000);


      const metadata = {
        name: `Badge de don - ${project.title}`,
        type: type,
        value: `${amount} ETH`,
        image: imageUrl,
        hash: "",
        previousOwners: [],
        createdAt: nowTimestamp,
        lastTransferAt: nowTimestamp,
        minter: account
      };


      const tokenURI = await uploadToIPFS(metadata);

      setStep('confirming');


      const amountInWei = parseEther(amount);

      const tx = await contract.donate(project.id, tokenURI, {
        value: amountInWei
      });

      setTxHash(tx.hash);

      setStep('confirming');
      showToast('Transaction submitted!', 'info');

    } catch (err: unknown) {
      setStep('error');

      const error = err as { code?: number; reason?: string; message?: string };
      let errorMessage = 'Failed to process donation';

      if (error.message && (error.message.includes("Limite de 4 badges atteinte") || error.message.includes("Cooldown"))) {
        errorMessage = error.message;
      } else if (error.reason) {
        errorMessage = error.reason;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setModalError(errorMessage);
      showToast('Donation failed', 'error');
    }
  }, [account, amount, getBadgeContract, project.id, project.title, showToast]);

  useEffect(() => {
    if (walletError && step === 'connecting') {
      setModalError(walletError);
      setStep('error');
      showToast(walletError, 'error');
    }
  }, [walletError, step, showToast]);

  useEffect(() => {
    if (isConnected && step === 'connecting') {
      const timer = setTimeout(() => {
        proceedToDonation();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, step, proceedToDonation]);

  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0);

  useEffect(() => {
    let isActive = true;
    const checkCooldown = async () => {
      if (!account || !isConnected) return;
      const contract = getBadgeContract();
      if (!contract) return;

      try {
        const lastAction = await contract.lastActionTimestamp(account);
        const lastActionDate = Number(lastAction) * 1000;
        const now = Date.now();
        const diffMs = now - lastActionDate;
        const COOLDOWN_MS = 5 * 60 * 1000;

        if (diffMs < COOLDOWN_MS) {
          const remaining = Math.ceil((COOLDOWN_MS - diffMs) / 1000);
          if (isActive) setCooldownRemaining(remaining);
        } else {
          if (isActive) setCooldownRemaining(0);
        }
      } catch (e) {
      }
    };

    checkCooldown();
    const interval = setInterval(() => {
      if (cooldownRemaining > 0) {
        setCooldownRemaining(prev => Math.max(0, prev - 1));
      } else {
        checkCooldown();
      }
    }, 1000);

    return () => {
      isActive = false;
      clearInterval(interval);
    };
  }, [account, isConnected, getBadgeContract, cooldownRemaining]);


  const quickAmounts = [0.1, 0.5, 1, 2, 5];

  const handleDonate = async () => {
    if (cooldownRemaining > 0) return;

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
              <Tooltip title={cooldownRemaining > 0 ? `Cooldown active. Wait ${Math.floor(cooldownRemaining / 60)}m ${cooldownRemaining % 60}s` : ''}>
                <span>
                  <Button
                    variant="contained"
                    onClick={handleDonate}
                    startIcon={<AccountBalanceWallet />}
                    disabled={!amount || parseFloat(amount) <= 0 || cooldownRemaining > 0}
                    sx={{ px: 4 }}
                  >
                    {cooldownRemaining > 0 ? `Wait ${Math.floor(cooldownRemaining / 60)}m ${cooldownRemaining % 60}s` : 'Donate Now'}
                  </Button>
                </span>
              </Tooltip>
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
                chainId={31337}
                onSuccess={async () => {
                  try {
                    await createDonation({
                      amount: amount,
                      txHash: txHash,
                      donorWallet: account || '',
                      projectId: project.id,
                    });
                    setStep('success');
                  } catch (err) {
                    console.error('Failed to sync donation to backend:', err);
                    setStep('success'); // Still show success as BC tx confirmed
                    showToast('Donation confirmed on blockchain but failed to sync to dashboard', 'warning');
                  }
                }}
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
        <Typography component="span" variant="h6" sx={{ fontWeight: 700 }}>
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
