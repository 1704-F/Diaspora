import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssociationsService } from './associations.service';
import { CreateAssociationDto, UpdateAssociationDto } from './dto';
import { JwtAuthGuard } from '@/shared/guards/jwt-auth.guard';
import { CurrentUser } from '@/shared/decorators/current-user.decorator';

@ApiTags('associations')
@Controller('associations')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssociationsController {
  constructor(private readonly associationsService: AssociationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new association' })
  @ApiResponse({ status: 201, description: 'Association created successfully' })
  @ApiResponse({ status: 409, description: 'Association with this slug already exists' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createAssociationDto: CreateAssociationDto, @CurrentUser() user: any) {
    return this.associationsService.create(createAssociationDto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all associations for the current user' })
  @ApiResponse({ status: 200, description: 'List of associations' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll(@CurrentUser() user: any) {
    return this.associationsService.findAllForUser(user.id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get association by slug' })
  @ApiResponse({ status: 200, description: 'Association found' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  async findBySlug(@Param('slug') slug: string, @CurrentUser() user: any) {
    return this.associationsService.findBySlug(slug, user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get association by ID' })
  @ApiResponse({ status: 200, description: 'Association found' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.associationsService.findOne(id, user.id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get association statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Access denied' })
  async getStats(@Param('id') id: string, @CurrentUser() user: any) {
    return this.associationsService.getStats(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update association' })
  @ApiResponse({ status: 200, description: 'Association updated successfully' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  @ApiResponse({ status: 403, description: 'Access denied - insufficient permissions' })
  @ApiResponse({ status: 409, description: 'Slug already exists' })
  async update(
    @Param('id') id: string,
    @Body() updateAssociationDto: UpdateAssociationDto,
    @CurrentUser() user: any,
  ) {
    return this.associationsService.update(id, updateAssociationDto, user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete (deactivate) association' })
  @ApiResponse({ status: 200, description: 'Association deactivated successfully' })
  @ApiResponse({ status: 404, description: 'Association not found' })
  @ApiResponse({ status: 403, description: 'Only president can delete association' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.associationsService.remove(id, user.id);
  }
}
