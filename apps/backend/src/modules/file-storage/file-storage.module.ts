import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { FileStorageService } from './file-storage.service';
import { FileStorageController } from './file-storage.controller';
import { File } from './entities/file.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([File]),
    ConfigModule,
  ],
  controllers: [FileStorageController],
  providers: [FileStorageService],
  exports: [FileStorageService],
})
export class FileStorageModule {}
