import {
  Injectable,
  InternalServerErrorException,
  UploadedFile,
} from '@nestjs/common';
import { CreateFileDto } from './dto/create-file.dto';
import { UpdateFileDto } from './dto/update-file.dto';
import { s3Client } from './helpers/aws-s3-sdk.helper';

import {
  AssociateCertificateCommand,
  AssociateCertificateCommandInput,
  CreateJobCommandInput,
  CreateJobCommand,
  Input,
  OutputGroup,
  Output,
  GetJobCommand,
  GetJobCommandInput,
} from '@aws-sdk/client-mediaconvert';
import {
  S3Client,
  PutObjectCommandInput,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { createReadStream } from 'fs';
import { mediaConvertClient } from './helpers/aws-media-convert.helper';

@Injectable()
export class FileService {
  async uploadVideo(file: Express.Multer.File) {
    //upload to S3
    console.log(file);
    const { path = '', mimetype, filename } = file;
    const fileStream = createReadStream(path);
    const uploadParams: PutObjectCommandInput = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key:
        mimetype === 'video/mp4' ? `videos/${filename}` : `images/${filename}`,
      ContentType: mimetype,
      Body: fileStream,
    };
    const commandS3 = new PutObjectCommand(uploadParams);
    try {
      const result = await s3Client().send(commandS3);
      if (result.$metadata.httpStatusCode !== 200) {
        throw new InternalServerErrorException('hubo un error - check logs');
      }
      //Now extract from s3 to mediaConverte and send to s3 converte(apply cost per minute converted)
      //!Para que el usuario con las credenciales que usas en esta aplicacion puede agregar roles para crear un job necesitas agregarle un role al usuario el cual es AWSMediaConverteFullAcess o algo asi y por supuesto los de s3 getObject
      const input: Input = {
        TimecodeSource: 'ZEROBASED',
        VideoSelector: {},
        AudioSelectors: {
          'Audio Selector 1': {
            DefaultSelection: 'DEFAULT',
          },
        },
        FileInput: `s3://${process.env.AWS_BUCKET_NAME}/videos/${filename}`,
      };
      const destination = `s3://${process.env.AWS_BUCKET_NAME}/videos/`;
      const outputs: Output = {
        Preset:
          'System-Generic_Hd_Mp4_Av1_Aac_16x9_1280x720p_24Hz_3.5Mbps_Qvbr_Vq8',
        Extension: 'mp4',
        NameModifier: 'converted',
      };
      // ContainerSettings: { Mp4Settings: { }
      const outPut: OutputGroup = {
        CustomName: 'output_videos_media',
        Name: 'File Group',
        OutputGroupSettings: {
          Type: 'FILE_GROUP_SETTINGS',
          FileGroupSettings: {
            Destination: destination,
          },
        },
        Outputs: [outputs],
      };

      const params: CreateJobCommandInput = {
        Settings: {
          Inputs: [input],
          OutputGroups: [outPut],
          TimecodeConfig: {
            Source: 'ZEROBASED',
          },
        },

        Role: process.env.AWS_IAM_ROLE,
      };
      const command = new CreateJobCommand(params);
      const mediaResult = await mediaConvertClient().send(command);
      const inputJob: GetJobCommandInput = {
        Id: mediaResult.Job.Id,
      };
      console.log('percent is:', mediaResult.Job.JobPercentComplete);
      const commandJob = new GetJobCommand(inputJob);
      const getJobDetails = await mediaConvertClient().send(commandJob);
      console.log('percent actual is:', getJobDetails.Job.JobPercentComplete);

      return mediaResult;
    } catch (error) {
      console.log(error);
    }
  }
}
