import { useState, type ReactNode } from 'react';
import {
    Box,
    Typography,
    Paper,
    Tab,
    Tabs,
    Card,
    CardContent,
    Avatar
} from '@mui/material';
import { Favorite } from '@mui/icons-material';
import type { Project } from '../../types/project';

interface TabPanelProps {
    children?: ReactNode;
    index: number;
    value: number;
}

const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`project-tabpanel-${index}`}
            aria-labelledby={`project-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
        </div>
    );
};

interface ProjectTabsProps {
    project: Project;
}

const ProjectTabs = ({ project }: ProjectTabsProps) => {
    const [tabValue, setTabValue] = useState(0);

    return (
        <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider' }}>
            <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                sx={{
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <Tab label="Overview" />
                <Tab label={`Backers (${project.backers})`} />
                <Tab label="Updates" />
                <Tab label="Comments" />
            </Tabs>

            <TabPanel value={tabValue} index={0}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 4 }}>
                    
                    <Box
                        sx={{
                            p: 3,
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 2,
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box component="span" sx={{ color: 'primary.main' }}>ℹ️</Box> Project Mission
                        </Typography>
                        <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.8 }}>
                            {project.description}
                        </Typography>
                    </Box>

                    
                    <Box
                        sx={{
                            p: 3,
                            bgcolor: 'rgba(255, 255, 255, 0.03)',
                            backdropFilter: 'blur(12px)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: 2,
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center',
                        }}
                    >
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Box component="span" sx={{ color: '#00f2ff' }}>🪙</Box> DAO Stats
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mt: 1 }}>
                            <Box>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Total Staked
                                </Typography>
                                <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                                    1,420 ETH
                                </Typography>
                            </Box>
                            <Box sx={{ textAlign: 'right' }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                                    Members
                                </Typography>
                                <Typography variant="h5" sx={{ color: 'white', fontWeight: 700 }}>
                                    8.4k
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Recent Backers
                </Typography>
                {[1, 2, 3, 4, 5].map((backer, index) => (
                    <Box
                        key={backer}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            py: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Avatar sx={{ bgcolor: 'primary.main' }}>B{backer}</Avatar>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                Backer {backer}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                Donated {(0.5 + index * 0.2).toFixed(2)} ETH • {index + 1} days ago
                            </Typography>
                        </Box>
                        <Favorite sx={{ color: '#ef4444', fontSize: 20 }} />
                    </Box>
                ))}
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Project Updates
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                                3 days ago
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                Milestone Reached!
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                We've successfully reached 50% of our funding goal. Thank you to all our supporters!
                            </Typography>
                        </CardContent>
                    </Card>
                    <Card variant="outlined">
                        <CardContent>
                            <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                                1 week ago
                            </Typography>
                            <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
                                Project Launch
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                We're excited to launch this project and start making a difference together.
                            </Typography>
                        </CardContent>
                    </Card>
                </Box>
            </TabPanel>

            <TabPanel value={tabValue} index={3}>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 3 }}>
                    Comments
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
                    Be the first to comment on this project!
                </Typography>
            </TabPanel>
        </Paper>
    );
};

export default ProjectTabs;
