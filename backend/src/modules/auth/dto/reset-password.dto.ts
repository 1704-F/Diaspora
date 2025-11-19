import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    example: 'StrongNewP@ssw0rd!',
    description:
      'Password must be at least 12 characters and contain uppercase, lowercase, number, and special character',
  })
  @IsString()
  @MinLength(12, {
    message: 'Password must be at least 12 characters long',
  })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_\-+={}[\]:;"'<>,.?/~`])[A-Za-z\d@$!%*?&#^()_\-+={}[\]:;"'<>,.?/~`]{12,}$/,
    {
      message:
        'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
    },
  )
  newPassword: string;
}
