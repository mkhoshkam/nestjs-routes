import { Controller, Get, Post, Put, Delete } from '@nestjs/common';

@Controller()
export class TestController {
    @Get()
    getRoot() {
        return { message: 'Hello World' };
    }

    @Get('health')
    getHealth() {
        return { status: 'ok' };
    }

    @Post('test')
    createTest() {
        return { message: 'Created' };
    }
} 