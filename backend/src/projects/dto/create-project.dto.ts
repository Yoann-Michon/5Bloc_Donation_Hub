import { IsString, IsDecimal, IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { ProjectStatus } from '@prisma/client';

export class CreateProjectDto {
    @IsString()
    @IsNotEmpty()
    title: string;

    @IsString()
    @IsNotEmpty()
    description: string;

    @IsNotEmpty()
    goal: string; // Decimal passed as string to avoid precision loss

    @IsString()
    @IsNotEmpty()
    category: string;

    @IsOptional()
    @IsString()
    image?: string;

    @IsString()
    @IsNotEmpty()
    ownerWallet: string;
}
