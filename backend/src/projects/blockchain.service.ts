import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ethers } from 'ethers';

const DONATION_BADGE_ABI = [
  'function withdrawProjectFunds(uint256 projectId, address payable recipient) external',
  'function setProjectOwner(uint256 projectId, address projectOwner) external',
  'function getProjectBalance(uint256 projectId) view returns (uint256)',
  'event FundsWithdrawn(uint256 indexed projectId, address indexed recipient, uint256 amount)',
];

@Injectable()
export class ProjectBlockchainService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private wallet: ethers.Wallet;

  constructor(private configService: ConfigService) {
    const rpcUrl =
      this.configService.get<string>('BLOCKCHAIN_RPC_URL') ||
      'http://localhost:8545';
    const contractAddress = this.configService.get<string>('CONTRACT_ADDRESS');
    const privateKey = this.configService.get<string>('ADMIN_PRIVATE_KEY');

    this.provider = new ethers.JsonRpcProvider(rpcUrl);

    if (privateKey) {
      this.wallet = new ethers.Wallet(privateKey, this.provider);
      this.contract = new ethers.Contract(
        contractAddress,
        DONATION_BADGE_ABI,
        this.wallet,
      );
    } else {

      this.contract = new ethers.Contract(
        contractAddress,
        DONATION_BADGE_ABI,
        this.provider,
      );
    }
  }

  async getProjectBalance(projectId: number): Promise<string> {
    const balance = await this.contract.getProjectBalance(projectId);
    return ethers.formatEther(balance);
  }

  async setProjectOwner(
    projectId: number,
    ownerAddress: string,
  ): Promise<string> {
    const tx = await this.contract.setProjectOwner(projectId, ownerAddress);
    await tx.wait();
    return tx.hash;
  }

  async withdrawProjectFunds(
    projectId: number,
    recipientAddress: string,
  ): Promise<string> {
    const tx = await this.contract.withdrawProjectFunds(
      projectId,
      recipientAddress,
    );
    await tx.wait();
    return tx.hash;
  }
}
