import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthDto } from '../../presentation/dtos/auth.dto';

@Injectable()
export class AuthService {
  async login(authDto: AuthDto) {
    // Implementação mock para fins de autenticação administrativa
    if (authDto.email === 'admin@bigchatbrasil.com.br' && authDto.password === 'admin123') {
      return {
        access_token: 'mock-jwt-token',
        user: {
          email: authDto.email,
          role: 'ADMIN',
        },
      };
    }
    throw new UnauthorizedException('Credenciais inválidas');
  }
}
