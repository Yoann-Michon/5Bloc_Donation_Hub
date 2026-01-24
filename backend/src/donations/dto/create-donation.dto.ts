import { IsString, IsNotEmpty, IsInt } from 'class-validator';

export class CreateDonationDto {
    @IsNotEmpty()
    amount: string;

    @IsString()
    @IsNotEmpty()
    txHash: string;

    @IsString()
    @IsNotEmpty()
    donorWallet: string;

    @IsInt()
    @IsNotEmpty()
    projectId: number;
}
