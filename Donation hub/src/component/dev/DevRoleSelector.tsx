import { Box, Button, Typography, Paper, ButtonGroup } from '@mui/material';
import { UserRole } from '../../types/user';
import { Person, Business, AdminPanelSettings } from '@mui/icons-material';

interface DevRoleSelectorProps {
    currentRole: UserRole;
    onRoleChange: (role: UserRole) => void;
}

const DevRoleSelector = ({ currentRole, onRoleChange }: DevRoleSelectorProps) => {
    const handleChange = (role: UserRole) => {
        onRoleChange(role);
        localStorage.setItem('dev_role', role);
        // Force page reload to apply new role everywhere
        window.location.reload();
    };

    if (import.meta.env.MODE !== 'development') {
        return null;
    }

    const roles = [
        { role: UserRole.USER, label: 'USER', icon: <Person />, color: '#2196f3' },
        { role: UserRole.ASSOCIATION, label: 'ASSO', icon: <Business />, color: '#4caf50' },
        { role: UserRole.ADMIN, label: 'ADMIN', icon: <AdminPanelSettings />, color: '#f44336' },
    ];

    return (
        <Paper
            sx={{
                position: 'fixed',
                bottom: 16,
                right: 16,
                p: 1.5,
                zIndex: 9999,
                bgcolor: 'rgba(255, 152, 0, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '2px solid #ff9800',
                borderRadius: 2,
            }}
        >
            <Typography variant="caption" sx={{ fontWeight: 700, color: 'white', mb: 1, display: 'block', textAlign: 'center' }}>
                🔧 DEV MODE
            </Typography>
            <ButtonGroup size="small" sx={{ display: 'flex' }}>
                {roles.map(({ role, label, icon, color }) => (
                    <Button
                        key={role}
                        onClick={() => handleChange(role)}
                        startIcon={icon}
                        sx={{
                            bgcolor: currentRole === role ? color : 'rgba(255,255,255,0.9)',
                            color: currentRole === role ? 'white' : 'black',
                            fontWeight: currentRole === role ? 700 : 500,
                            fontSize: '0.7rem',
                            px: 1.5,
                            '&:hover': {
                                bgcolor: currentRole === role ? color : 'rgba(255,255,255,1)',
                            },
                        }}
                    >
                        {label}
                    </Button>
                ))}
            </ButtonGroup>
            <Typography variant="caption" sx={{ color: 'white', mt: 0.5, display: 'block', textAlign: 'center', opacity: 0.9, fontSize: '0.65rem' }}>
                Current: {currentRole}
            </Typography>
        </Paper>
    );
};

export default DevRoleSelector;
