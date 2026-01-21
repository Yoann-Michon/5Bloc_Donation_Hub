import { Container } from '@mui/material';
import DashboardProfile from '../component/dashboard/DashboardProfile';
import DashboardStats from '../component/dashboard/DashboardStats';
import BadgeGallery from '../component/dashboard/BadgeGallery';
import TransactionHistory from '../component/web3/TransactionHistory';

const Dashboard = () => {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <DashboardProfile />
      <DashboardStats />
      <BadgeGallery />
      <TransactionHistory />
    </Container>
  );
};

export default Dashboard;
