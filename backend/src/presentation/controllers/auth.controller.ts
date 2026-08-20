import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from '../../application/services/auth.service';
import { AuthRequestDto } from '../dtos/auth.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Realizar login do cliente via documento' })
  @ApiResponse({ status: 200, description: 'Login realizado com sucesso' })
  @ApiResponse({
    status: 404,
    description: 'Cliente não encontrado com o documento informado',
  })
  login(@Body() authRequestDto: AuthRequestDto) {
    return this.authService.login(authRequestDto);
  }
}
