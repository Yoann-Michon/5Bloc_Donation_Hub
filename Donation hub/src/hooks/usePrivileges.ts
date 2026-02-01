import { useState, useEffect } from 'react';
import { getUserTier, getPrivileges } from '../utils/api';
import { useWallet } from './useWallet';
import { BadgeTier } from '../types/enums';

interface Privilege {
  id: string;
  type: string;
  name: string;
  description: string | null;
  requiredTier: BadgeTier;
}

export const usePrivileges = () => {
  const { account } = useWallet();
  const [tier, setTier] = useState<BadgeTier | null>(null);
  const [privileges, setPrivileges] = useState<Privilege[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!account) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [tierData, privData] = await Promise.all([
          getUserTier(account),
          getPrivileges(),
        ]);

        setTier(tierData.tier);
        setPrivileges(privData);
        setError(null);
      } catch (err) {
        setError('Failed to load privileges');
        console.error('Failed to load privileges:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [account]);

  const hasPrivilege = (privilegeType: string): boolean => {
    if (!tier) return false;

    const privilege = privileges.find((p) => p.type === privilegeType);
    if (!privilege) return false;

    const tierOrder: Record<BadgeTier, number> = {
      [BadgeTier.BRONZE]: 1,
      [BadgeTier.SILVER]: 2,
      [BadgeTier.GOLD]: 3,
      [BadgeTier.DIAMOND]: 4,
    };

    return tierOrder[tier] >= tierOrder[privilege.requiredTier];
  };

  return { tier, privileges, hasPrivilege, loading, error };
};
