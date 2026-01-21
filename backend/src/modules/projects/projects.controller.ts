import { Controller, Get, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ProjectsService } from './projects.service';

@ApiTags('projects')
@Controller('projects')
export class ProjectsController {
    constructor(private readonly projectsService: ProjectsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all projects with pagination and filters' })
    @ApiQuery({ name: 'page', required: false, type: Number })
    @ApiQuery({ name: 'limit', required: false, type: Number })
    @ApiQuery({ name: 'status', required: false, enum: ['active', 'closed', 'all'] })
    @ApiQuery({ name: 'category', required: false, type: String })
    @ApiResponse({ status: 200, description: 'Projects retrieved successfully' })
    async findAll(
        @Query('page') page: string = '1',
        @Query('limit') limit: string = '20',
        @Query('status') status: string = 'active',
        @Query('category') category?: string,
    ) {
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        if (isNaN(pageNum) || pageNum < 1) {
            throw new HttpException('Invalid page number', HttpStatus.BAD_REQUEST);
        }

        if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
            throw new HttpException('Limit must be between 1 and 100', HttpStatus.BAD_REQUEST);
        }

        return await this.projectsService.findAll(pageNum, limitNum, status, category);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get project by ID' })
    @ApiResponse({ status: 200, description: 'Project retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Project not found' })
    async findOne(@Param('id') id: string) {
        const projectId = parseInt(id, 10);

        if (isNaN(projectId)) {
            throw new HttpException('Invalid project ID', HttpStatus.BAD_REQUEST);
        }

        const project = await this.projectsService.findOne(projectId);

        if (!project) {
            throw new HttpException('Project not found', HttpStatus.NOT_FOUND);
        }

        return project;
    }
}
