import { IsString, IsOptional, IsEmail, IsEnum } from 'class-validator';
import { UserRole } from '@prisma/client';

export class CreateUserDto {
    @IsString()
    walletAddress: string;

    @IsOptional()
    @IsEnum(UserRole)
    role?: UserRole;

    @IsOptional()
    @IsString()
    organizationName?: string;

    @IsOptional()
    @IsEmail()
    email?: string;
}
