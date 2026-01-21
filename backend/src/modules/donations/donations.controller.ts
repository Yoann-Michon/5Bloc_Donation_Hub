import { Controller, Get, Query, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DonationsService } from './donations.service';

@ApiTags('donations')
@Controller('donations')
export class DonationsController {
    constructor(private readonly donationsService: DonationsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all donations with filters' })
    @ApiQuery({ name: 'projectId', required: false, type: Number })
    @ApiQuery({ name: 'donor', required: false, type: String })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Donations retrieved successfully' })
    async findAll(
        @Query('projectId') projectId?: string,
        @Query('donor') donor?: string,
        @Query('limit') limit: string = '50',
    ) {
        const limitNum = parseInt(limit, 10);

        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            throw new HttpException('Limit must be between 1 and 100', HttpStatus.BAD_REQUEST);
        }

        return await this.donationsService.findAll(
            projectId ? parseInt(projectId, 10) : undefined,
            donor,
            limitNum,
        );
    }

    @Get('recent')
    @ApiOperation({ summary: 'Get recent donations (last 24 hours)' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Recent donations retrieved successfully' })
    async findRecent(@Query('limit') limit: string = '10') {
        const limitNum = parseInt(limit, 10);

        if (isNaN(limitNum) || limitNum < 1 || limitNum > 50) {
            throw new HttpException('Limit must be between 1 and 50', HttpStatus.BAD_REQUEST);
        }

        return await this.donationsService.findRecent(limitNum);
    }

    @Get(':hash')
    @ApiOperation({ summary: 'Get donation by transaction hash' })
    @ApiResponse({ status: 200, description: 'Donation retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Donation not found' })
    async findByHash(@Param('hash') hash: string) {
        const donation = await this.donationsService.findByHash(hash);

        if (!donation) {
            throw new HttpException('Donation not found', HttpStatus.NOT_FOUND);
        }

        return donation;
    }
}
