import { Body, Controller, Delete, Get, Param, Put } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import * as nestjsBetterAuth from '@thallesp/nestjs-better-auth';
import { UserService } from './user.service';
import { RequireRoles } from '../auth/roles.decorator';
import { UpdateUserDto } from './dto/UpdateUser.dto';

@ApiTags('Users')
@ApiBearerAuth('bearer')
@Controller(['users'])
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiOperation({ summary: 'Get the authenticated user profile.' })
  @ApiOkResponse({ description: 'Current user profile returned.' })
  @Get('me')
  @RequireRoles('viewer', 'analyst', 'admin')
  getProfile(
    @nestjsBetterAuth.Session() session: nestjsBetterAuth.UserSession,
  ) {
    return { user: session.user };
  }

  @ApiOperation({ summary: 'List users.' })
  @ApiOkResponse({ description: 'Users fetched successfully.' })
  @Get()
  @RequireRoles('analyst', 'admin')
  listUsers() {
    return this.userService.listUsers();
  }

  @ApiOperation({ summary: 'Get a user by ID.' })
  @ApiParam({ name: 'id', type: String, description: 'User ID.' })
  @ApiOkResponse({ description: 'User record returned.' })
  @Get(':id')
  @RequireRoles('analyst', 'admin')
  getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }

  @ApiOperation({ summary: 'Update a user by ID.' })
  @ApiParam({ name: 'id', type: String, description: 'User ID.' })
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ description: 'User updated successfully.' })
  @Put(':id')
  @RequireRoles('admin')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.updateUser(id, body);
  }

  @ApiOperation({ summary: 'Deactivate a user by ID.' })
  @ApiParam({ name: 'id', type: String, description: 'User ID.' })
  @ApiOkResponse({ description: 'User deactivated successfully.' })
  @Delete(':id')
  @RequireRoles('admin')
  deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
