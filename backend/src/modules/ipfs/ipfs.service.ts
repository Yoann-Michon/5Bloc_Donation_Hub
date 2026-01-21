import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface TokenMetadata {
    name: string;
    description: string;
    type: string;
    value: string;
    image: string;
    external_url?: string;
    attributes: Array<{
        trait_type: string;
        value: string | number;
        display_type?: string;
    }>;
    previousOwners: string[];
    createdAt: string;
    lastTransferAt: string;
}

@Injectable()
export class IpfsService {
    private readonly pinataApiKey: string;
    private readonly pinataSecretKey: string;
    private readonly pinataApiUrl = 'https://api.pinata.cloud';
    private readonly pinataGateway = 'https://gateway.pinata.cloud/ipfs';

    constructor(private configService: ConfigService) {
        this.pinataApiKey = this.configService.get<string>('PINATA_API_KEY') || '';
        this.pinataSecretKey = this.configService.get<string>('PINATA_SECRET_KEY') || '';

        if (!this.pinataApiKey || !this.pinataSecretKey) {
            console.warn('⚠️  Pinata credentials not configured. IPFS features disabled.');
        } else {
            console.log('✅ IPFS service initialized with Pinata');
        }
    }

    async uploadMetadata(metadata: TokenMetadata): Promise<string> {
        if (!this.pinataApiKey || !this.pinataSecretKey) {
            throw new Error('Pinata credentials not configured');
        }

        try {
            const response = await axios.post(
                `${this.pinataApiUrl}/pinning/pinJSONToIPFS`,
                metadata,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        pinata_api_key: this.pinataApiKey,
                        pinata_secret_api_key: this.pinataSecretKey,
                    },
                },
            );

            const cid = response.data.IpfsHash;
            console.log(`✅ Metadata uploaded to IPFS: ${cid}`);
            return cid;
        } catch (error) {
            console.error('Error uploading to IPFS:', error);
            throw new Error('Failed to upload metadata to IPFS');
        }
    }

    async getMetadata(cid: string): Promise<TokenMetadata> {
        try {
            const response = await axios.get(`${this.pinataGateway}/${cid}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching from IPFS:', error);
            throw new Error('Failed to fetch metadata from IPFS');
        }
    }

    generateTokenMetadata(
        tokenId: number,
        level: number,
        donationAmount: string,
        owner: string,
        projectTitle?: string,
    ): TokenMetadata {
        const levelNames = ['DONOR', 'SPONSOR', 'PATRON', 'BENEFACTOR'];
        const levelName = levelNames[level] || 'UNKNOWN';

        // Convert Wei to ETH for display
        const amountInEth = (BigInt(donationAmount) / BigInt(10 ** 18)).toString();

        return {
            name: `${levelName} Badge #${tokenId}`,
            description: `Donation badge for contributing ${amountInEth} ETH${projectTitle ? ` to ${projectTitle}` : ''}`,
            type: levelName,
            value: donationAmount,
            image: `https://cdn.communitydonationhub.io/badges/${levelName.toLowerCase()}.png`,
            external_url: `https://communitydonationhub.io/tokens/${tokenId}`,
            attributes: [
                {
                    trait_type: 'Level',
                    value: levelName,
                },
                {
                    trait_type: 'Donation Amount',
                    value: `${amountInEth} ETH`,
                },
                {
                    trait_type: 'Timestamp',
                    value: Math.floor(Date.now() / 1000),
                    display_type: 'date',
                },
            ],
            previousOwners: [owner],
            createdAt: new Date().toISOString(),
            lastTransferAt: new Date().toISOString(),
        };
    }

    getGatewayUrl(cid: string): string {
        return `${this.pinataGateway}/${cid}`;
    }
}
