import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UsersService } from './users.service';

@ApiTags('users')
@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Get(':address')
    @ApiOperation({ summary: 'Get user profile' })
    @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
    async getUserProfile(@Param('address') address: string) {
        return await this.usersService.getUserProfile(address);
    }

    @Get(':address/donations')
    @ApiOperation({ summary: 'Get user donation history' })
    @ApiResponse({ status: 200, description: 'User donations retrieved successfully' })
    async getUserDonations(@Param('address') address: string) {
        return await this.usersService.getUserDonations(address);
    }

    @Get(':address/activity')
    @ApiOperation({ summary: 'Get user activity (donations, conversions, transfers)' })
    @ApiResponse({ status: 200, description: 'User activity retrieved successfully' })
    async getUserActivity(@Param('address') address: string) {
        return await this.usersService.getUserActivity(address);
    }
}
