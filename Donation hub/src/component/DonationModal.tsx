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

type DonationStep = 'amount' | 'connecting' | 'confirming' | 'success' | 'error';

const DonationModal = ({ open, onClose, project }: DonationModalProps) => {
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<DonationStep>('amount');
  const [modalError, setModalError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string>('');

  const { connect, account, isConnected, error: walletError } = useWallet();
  const { showToast } = useToast();

  const proceedToDonation = useCallback(async () => {
    if (!window.ethereum || !account) {
      setModalError("Wallet not connected correctly");
      setStep('error');
      return;
    }

    try {

      const amountInWei = (parseFloat(amount) * 1e18).toString(16);

      const transactionHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: account,
          to: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
          value: '0x' + amountInWei,
        }],
      }) as string;

      setTxHash(transactionHash);
      setStep('success');
      showToast('Donation successful!', 'success');

    } catch (err: unknown) {
      const error = err as { code?: number; message?: string };
      setStep('error');
      if (error.code === 4001) {
        setModalError('Transaction rejected by user');
      } else {
        const errorMsg = error.message || 'Failed to process donation';
        setModalError(errorMsg);
        showToast(errorMsg, 'error');
      }
    }
  }, [account, amount, showToast]);

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
        setStep('confirming');
        proceedToDonation();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isConnected, step, proceedToDonation, showToast]);

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
      setStep('confirming');
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
                <NetworkSwitcher variant="default" showWarning={true} requiredChainId={1} />
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

      case 'confirming':
        return (
          <DialogContent>
            {txHash ? (
              <TransactionStatusIndicator
                txHash={txHash}
                chainId={1}
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
