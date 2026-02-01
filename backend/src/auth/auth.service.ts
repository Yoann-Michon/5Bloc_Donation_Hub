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
  ) { }

  async getNonce(walletAddress: string): Promise<{ nonce: string }> {
    let user = await this.usersService.findByWallet(walletAddress);

    if (!user) {

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


    const message = `Sign this nonce to authenticate: ${user.nonce}`;

    try {

      const recoveredAddress = ethers.verifyMessage(message, signature);

      if (recoveredAddress.toLowerCase() !== walletAddress.toLowerCase()) {
        throw new UnauthorizedException('Invalid signature');
      }


      const newNonce = uuidv4();
      await this.usersService.updateNonce(walletAddress, newNonce);


      await this.usersService.updateLastLogin(walletAddress);


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
          organizationName: user.organizationName || null,
          email: user.email || null,
          isActive: user.isActive,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Signature verification failed');
    }
  }

  async validateUser(payload: any) {
    return this.usersService.findByWallet(payload.walletAddress);
  }

  async getCurrentUser(walletAddress: string) {
    try {
      const user = await this.usersService.findByWallet(walletAddress);

      if (!user) {
        return null;
      }

      return {
        id: user.id,
        walletAddress: user.walletAddress,
        role: user.role,
        organizationName: user.organizationName || null,
        email: user.email || null,
        isActive: user.isActive,
      };
    } catch (error) {
      console.error(`Error in getCurrentUser for ${walletAddress}:`, error);
      throw error;
    }
  }
}
