import { Module } from '@nestjs/common';
import { MembersController } from './members.controller';
import { MembersService } from './members.service';
import { PrismaModule } from '@/shared/services/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MembersController],
  providers: [MembersService],
  exports: [MembersService],
})
export class MembersModule {}
