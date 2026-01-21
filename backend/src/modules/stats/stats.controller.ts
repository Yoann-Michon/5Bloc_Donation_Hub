import { Controller, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { StatsService } from './stats.service';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) { }

    @Get()
    @ApiOperation({ summary: 'Get global statistics' })
    @ApiResponse({ status: 200, description: 'Global stats retrieved successfully' })
    async getGlobalStats() {
        return await this.statsService.getGlobalStats();
    }

    @Get('projects/:id')
    @ApiOperation({ summary: 'Get project-specific statistics' })
    @ApiResponse({ status: 200, description: 'Project stats retrieved successfully' })
    async getProjectStats(@Param('id') id: string) {
        const projectId = parseInt(id, 10);

        if (isNaN(projectId)) {
            throw new HttpException('Invalid project ID', HttpStatus.BAD_REQUEST);
        }

        return await this.statsService.getProjectStats(projectId);
    }

    @Get('leaderboard')
    @ApiOperation({ summary: 'Get top donors leaderboard' })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully' })
    async getLeaderboard(@Query('limit') limit: string = '100') {
        const limitNum = parseInt(limit, 10);

        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            throw new HttpException('Limit must be between 1 and 100', HttpStatus.BAD_REQUEST);
        }

        return await this.statsService.getLeaderboard(limitNum);
    }
}
