import { Module } from '@nestjs/common';
import { TestController } from './test.controller';
import { UsersController } from './users.controller';

@Module({
    controllers: [TestController, UsersController],
})
export class TestAppModule { } 