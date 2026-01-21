import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

@Injectable()
export class BlockchainService {
    private provider: ethers.JsonRpcProvider;
    private contract: ethers.Contract | null = null;
    private readonly chainId: number;

    constructor(private configService: ConfigService) {
        const rpcUrl = this.configService.get<string>('ETHEREUM_RPC_URL');
        this.chainId = this.configService.get<number>('ETHEREUM_CHAIN_ID') || 11155111;

        if (!rpcUrl) {
            console.warn('⚠️  ETHEREUM_RPC_URL not configured. Blockchain features disabled.');
            return;
        }

        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        console.log(`✅ Connected to Ethereum network (Chain ID: ${this.chainId})`);

        this.initializeContract();
    }

    private initializeContract() {
        const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');

        if (!contractAddress) {
            console.warn('⚠️  CONTRACT_ADDRESS not configured. Contract interactions disabled.');
            return;
        }

        // Contract ABI will be added after smart contract deployment
        const contractABI = [
            // Placeholder - will be replaced with actual ABI
            'function getUserTokens(address _user) external view returns (tuple(uint256 tokenId, uint8 level, uint256 donationAmount, string metadataURI, uint256 mintedAt, uint256 lastTransferAt)[] memory)',
            'function getProjectDetails(uint256 _projectId) external view returns (tuple(uint256 projectId, address creator, string metadataURI, uint256 fundingGoal, uint256 totalRaised, uint256 deadline, bool isActive))',
            'event DonationMade(uint256 indexed projectId, address indexed donor, uint256 amount, uint8 badgeLevel)',
            'event TokenMinted(address indexed owner, uint256 indexed tokenId, uint8 level, string metadataURI)',
            'event TokenConverted(address indexed owner, uint256[] burnedTokenIds, uint256 newTokenId, uint8 newLevel)',
            'event ProjectCreated(uint256 indexed projectId, address indexed creator, uint256 fundingGoal)',
        ];

        this.contract = new ethers.Contract(contractAddress, contractABI, this.provider);
        console.log(`✅ Smart contract initialized at ${contractAddress}`);
    }

    getProvider(): ethers.JsonRpcProvider {
        return this.provider;
    }

    getContract(): ethers.Contract | null {
        return this.contract;
    }

    async getBlockNumber(): Promise<number> {
        return await this.provider.getBlockNumber();
    }

    async getTransactionReceipt(txHash: string) {
        return await this.provider.getTransactionReceipt(txHash);
    }

    async getUserTokens(address: string): Promise<any[]> {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        try {
            const tokens = await this.contract.getUserTokens(address);
            return tokens.map((token: any) => ({
                tokenId: token.tokenId.toString(),
                level: token.level,
                donationAmount: token.donationAmount.toString(),
                metadataURI: token.metadataURI,
                mintedAt: new Date(Number(token.mintedAt) * 1000),
                lastTransferAt: new Date(Number(token.lastTransferAt) * 1000),
            }));
        } catch (error) {
            console.error('Error fetching user tokens:', error);
            return [];
        }
    }

    async getProjectDetails(projectId: number): Promise<any> {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }

        try {
            const project = await this.contract.getProjectDetails(projectId);
            return {
                projectId: project.projectId.toString(),
                creator: project.creator,
                metadataURI: project.metadataURI,
                fundingGoal: project.fundingGoal.toString(),
                totalRaised: project.totalRaised.toString(),
                deadline: new Date(Number(project.deadline) * 1000),
                isActive: project.isActive,
            };
        } catch (error) {
            console.error('Error fetching project details:', error);
            return null;
        }
    }

    formatEther(wei: string): string {
        return ethers.formatEther(wei);
    }

    parseEther(ether: string): string {
        return ethers.parseEther(ether).toString();
    }

    isAddress(address: string): boolean {
        return ethers.isAddress(address);
    }
}
