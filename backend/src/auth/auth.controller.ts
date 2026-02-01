import { Controller, Post, Body, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { VerifySignatureDto } from './dto/verify-signature.dto';
import { Public } from '../decorators/public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Public()
  @Get('nonce')
  async getNonce(@Query('walletAddress') walletAddress: string) {
    return this.authService.getNonce(walletAddress);
  }

  @Public()
  @Post('verify')
  async verifySignature(@Body() verifySignatureDto: VerifySignatureDto) {
    return this.authService.verifySignature(
      verifySignatureDto.walletAddress,
      verifySignatureDto.signature,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getCurrentUser(@Request() req) {
    return this.authService.getCurrentUser(req.user.walletAddress);
  }
}
