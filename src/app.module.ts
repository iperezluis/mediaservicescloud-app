import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FileModule } from './file/file.module';
import { FileService } from './file/file.service';

import { mediaConvertClient } from './file/helpers/aws-media-convert.helper';
import { s3Client } from './file/helpers/aws-s3-sdk.helper';

@Module({
  imports: [
    FileModule,
    ConfigModule.forRoot({
      load: [s3Client, mediaConvertClient],
    }),
  ],
  providers: [FileService],
  exports: [FileService, ConfigModule],
})
export class AppModule {}
