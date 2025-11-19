import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { MembersService } from './members.service';
import { CreateMemberDto, UpdateMemberDto } from './dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';
import { CurrentTenant } from '@/shared/decorators/current-tenant.decorator';

@ApiTags('members')
@Controller('associations/:tenantId/members')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class MembersController {
  constructor(private readonly membersService: MembersService) {}

  @Post()
  @ApiOperation({ summary: 'Add a new member to the association' })
  @ApiResponse({ status: 201, description: 'Member created successfully' })
  @ApiResponse({ status: 409, description: 'User is already a member' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(
    @Param('tenantId') tenantId: string,
    @Body() createMemberDto: CreateMemberDto,
    @CurrentUser() user: any,
  ) {
    return this.membersService.create(tenantId, createMemberDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all members of the association' })
  @ApiQuery({ name: 'status', required: false, enum: ['ACTIVE', 'INACTIVE', 'SUSPENDED'] })
  @ApiQuery({ name: 'statusType', required: false })
  @ApiQuery({ name: 'sectionId', required: false })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, email or member number' })
  @ApiQuery({ name: 'skip', required: false, type: Number })
  @ApiQuery({ name: 'take', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of members' })
  async findAll(@Param('tenantId') tenantId: string, @Query() query: any) {
    return this.membersService.findAll(tenantId, query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get member by ID' })
  @ApiResponse({ status: 200, description: 'Member found' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async findOne(@Param('tenantId') tenantId: string, @Param('id') id: string) {
    return this.membersService.findOne(tenantId, id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get member statistics (contributions, payments, etc.)' })
  @ApiResponse({ status: 200, description: 'Member statistics retrieved' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async getStats(@Param('tenantId') tenantId: string, @Param('id') id: string) {
    return this.membersService.getMemberStats(tenantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update member information' })
  @ApiResponse({ status: 200, description: 'Member updated successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async update(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() updateMemberDto: UpdateMemberDto,
    @CurrentUser() user: any,
  ) {
    return this.membersService.update(tenantId, id, updateMemberDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Deactivate a member' })
  @ApiResponse({ status: 200, description: 'Member deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Member not found' })
  async remove(
    @Param('tenantId') tenantId: string,
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.membersService.remove(tenantId, id, user.id);
  }

  @Post(':memberId/roles/:roleId')
  @ApiOperation({ summary: 'Assign a role to a member' })
  @ApiResponse({ status: 201, description: 'Role assigned successfully' })
  @ApiResponse({ status: 404, description: 'Member or role not found' })
  @ApiResponse({ status: 409, description: 'Member already has this role' })
  async assignRole(
    @Param('tenantId') tenantId: string,
    @Param('memberId') memberId: string,
    @Param('roleId') roleId: string,
    @CurrentUser() user: any,
    @Body() body?: { validFrom?: Date; validUntil?: Date },
  ) {
    return this.membersService.assignRole(
      tenantId,
      memberId,
      roleId,
      user.id,
      body?.validFrom,
      body?.validUntil,
    );
  }

  @Delete(':memberId/roles/:roleId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a role from a member' })
  @ApiResponse({ status: 200, description: 'Role removed successfully' })
  @ApiResponse({ status: 404, description: 'Role assignment not found' })
  async removeRole(
    @Param('tenantId') tenantId: string,
    @Param('memberId') memberId: string,
    @Param('roleId') roleId: string,
    @CurrentUser() user: any,
  ) {
    return this.membersService.removeRole(tenantId, memberId, roleId, user.id);
  }
}
