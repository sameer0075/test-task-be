import { Type } from 'class-transformer';
import { IsArray, IsOptional } from 'class-validator';

export class CreateFileDto {
  @IsOptional()
  tags: string[];
}

export class UploadFileDto {
  @IsArray()
  @Type(() => Object)
  files: Array<{
    file: any;
    tags: string[];
  }>;
}
