import { Controller, Get, Post, Put, Delete, Param } from '@nestjs/common';

@Controller('users')
export class UsersController {
    @Get()
    findAll() {
        return { users: [] };
    }

    @Post()
    create() {
        return { message: 'User created' };
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return { user: { id } };
    }

    @Put(':id')
    update(@Param('id') id: string) {
        return { message: `User ${id} updated` };
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return { message: `User ${id} deleted` };
    }
} 