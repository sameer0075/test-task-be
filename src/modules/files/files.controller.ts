import {
  Controller,
  Post,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Req,
  Get,
  Param,
  Res,
  HttpException,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { CreateFileDto } from './dto/create-file.dto';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/common/guard/auth.guard';
import { Response } from 'express';
import StatusCodes from 'src/common/enums/ErrorCodes';
import { FileEndpoints } from 'src/shared/endpoints';

@ApiTags('File Upload')
@UseGuards(JwtAuthGuard)
@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post(FileEndpoints.createFile)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // Limit to 10 MB
      fileFilter: (req, file, callback) => {
        const mimeType = file.mimetype;
        if (
          mimeType === 'image/jpeg' ||
          mimeType === 'image/png' ||
          mimeType === 'image/gif' ||
          mimeType === 'video/mp4' ||
          mimeType === 'video/webm'
        ) {
          callback(null, true);
        } else {
          callback(
            new Error(
              'Invalid file type. Only image and video files are allowed.',
            ),
            false,
          );
        }
      },
    }),
  )
  async create(
    @Req() req,
    @Res() response: Response,
    @UploadedFile() file,
    @Body() body: CreateFileDto,
  ) {
    try {
      const data = await this.filesService.upload(file, req.user.id);
      response.status(StatusCodes.SUCCESS).send(data);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/:id')
  async getFile(@Res() response: Response, @Param('id') id) {
    try {
      const data = await this.filesService.getFile(id);
      response.status(StatusCodes.SUCCESS).send(data);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Get(FileEndpoints.getUserFiles)
  async getFiles(@Req() req, @Res() response: Response) {
    try {
      const data = await this.filesService.getFiles(req.user.id);
      response.status(StatusCodes.SUCCESS).send(data);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Put(FileEndpoints.updatePriority)
  async updatePriority(@Req() req, @Res() response: Response, @Body() body) {
    try {
      const data = await this.filesService.updatePriority(body);
      response.status(StatusCodes.SUCCESS).send(data);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }

  @Get('/update-view/:id')
  async updateView(@Req() req, @Res() response: Response, @Param('id') id) {
    try {
      const data = await this.filesService.updateView(id, req.user.id);
      response.status(StatusCodes.SUCCESS).send(data);
    } catch (error) {
      throw new HttpException(error, HttpStatus.BAD_REQUEST);
    }
  }
}
