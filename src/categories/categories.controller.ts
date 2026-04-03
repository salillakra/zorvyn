import { Controller, Get } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { RequireRoles } from '../auth/roles.decorator';

@ApiTags('Categories')
@ApiBearerAuth('bearer')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @ApiOperation({ summary: 'List seeded categories (read-only).' })
  @ApiOkResponse({ description: 'Categories returned successfully.' })
  @Get()
  @RequireRoles('viewer', 'analyst', 'admin')
  listCategories() {
    return this.categoriesService.listCategories();
  }
}
