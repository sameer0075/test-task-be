// file.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class File extends Document {
  @Prop({ required: true })
  filename: string;

  @Prop({ required: true })
  fileType: string; // e.g., 'image' or 'video'

  @Prop({ required: true })
  fileUrl: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ default: false })
  isShared: boolean;

  @Prop({ default: 1 })
  priority: number;

  @Prop({ default: 0 })
  totalViews: number;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  owner: Types.ObjectId; // Reference to the user who uploaded the file

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const FileSchema = SchemaFactory.createForClass(File);
