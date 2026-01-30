import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { ethers } from 'ethers';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async getNonce(walletAddress: string): Promise<{ nonce: string }> {
    let user = await this.usersService.findByWallet(walletAddress);

    if (!user) {
      // Create user if doesn't exist
      user = await this.usersService.create({
        walletAddress,
      });
    }

    return { nonce: user.nonce };
  }

  async verifySignature(
    walletAddress: string,
    signature: string,
  ): Promise<{ accessToken: string; user: any }> {
    const user = await this.usersService.findByWallet(walletAddress);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Construct the message that was signed
    const message = `Sign this nonce to authenticate: ${user.nonce}`;

    try {
      // Verify the signature
      const recoveredAddress = ethers.verifyMessage(message, signature);

      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new UnauthorizedException('Invalid signature');
      }

      // Generate new nonce for next login
      const newNonce = uuidv4();
      await this.usersService.updateNonce(walletAddress, newNonce);

      // Update last login
      await this.usersService.updateLastLogin(walletAddress);

      // Generate JWT
      const payload = {
        walletAddress: user.walletAddress,
        role: user.role,
        sub: user.id,
      };

      const accessToken = this.jwtService.sign(payload);

      return {
        accessToken,
        user: {
          id: user.id,
          walletAddress: user.walletAddress,
          role: user.role,
          username: user.username,
          email: user.email,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Signature verification failed');
    }
  }

  async validateUser(payload: any) {
    return this.usersService.findByWallet(payload.walletAddress);
  }
}
