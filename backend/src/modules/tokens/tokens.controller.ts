import { Controller, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { TokensService } from './tokens.service';

@ApiTags('tokens')
@Controller('tokens')
export class TokensController {
    constructor(private readonly tokensService: TokensService) { }

    @Get('user/:address')
    @ApiOperation({ summary: 'Get all tokens owned by a user' })
    @ApiResponse({ status: 200, description: 'User tokens retrieved successfully' })
    @ApiResponse({ status: 400, description: 'Invalid address' })
    async getUserTokens(@Param('address') address: string) {
        return await this.tokensService.getUserTokens(address);
    }

    @Get(':tokenId')
    @ApiOperation({ summary: 'Get token details by ID' })
    @ApiResponse({ status: 200, description: 'Token retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Token not found' })
    async getToken(@Param('tokenId') tokenId: string) {
        const id = parseInt(tokenId, 10);

        if (isNaN(id)) {
            throw new HttpException('Invalid token ID', HttpStatus.BAD_REQUEST);
        }

        const token = await this.tokensService.getToken(id);

        if (!token) {
            throw new HttpException('Token not found', HttpStatus.NOT_FOUND);
        }

        return token;
    }

    @Get(':tokenId/history')
    @ApiOperation({ summary: 'Get token transfer history' })
    @ApiResponse({ status: 200, description: 'Token history retrieved successfully' })
    async getTokenHistory(@Param('tokenId') tokenId: string) {
        const id = parseInt(tokenId, 10);

        if (isNaN(id)) {
            throw new HttpException('Invalid token ID', HttpStatus.BAD_REQUEST);
        }

        return await this.tokensService.getTokenHistory(id);
    }
}
