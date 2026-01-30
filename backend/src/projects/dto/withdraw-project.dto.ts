import { IsString, IsEthereumAddress } from 'class-validator';

export class WithdrawProjectDto {
  @IsEthereumAddress()
  recipientAddress: string;
}
