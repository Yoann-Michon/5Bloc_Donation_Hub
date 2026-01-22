import { Container } from '@mui/material';
import DashboardProfile from '../component/dashboard/DashboardProfile';
import DashboardStats from '../component/dashboard/DashboardStats';
import BadgeGallery from '../component/dashboard/BadgeGallery';
import TransactionHistory from '../component/web3/TransactionHistory';
import { useDonationHistory } from '../hooks/useDonationHistory';

const Dashboard = () => {
  const { transactions, isLoading, refresh } = useDonationHistory();

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <DashboardProfile />
      <DashboardStats />
      <BadgeGallery />
      <TransactionHistory transactions={transactions} isLoading={isLoading} onRefresh={refresh} />
    </Container>
  );
};

export default Dashboard;
