import { IsString, IsEthereumAddress } from 'class-validator';

export class VerifySignatureDto {
  @IsEthereumAddress()
  walletAddress: string;

  @IsString()
  signature: string;
}
