import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PermissionDocument = Permission & Document;

@Schema({ timestamps: true })
export class Permission {
  _id: Types.ObjectId;

  @Prop({ required: true, unique: true })
  name: string; // e.g., 'users:create', 'posts:read'

  @Prop()
  description?: string;

  createdAt: Date;
  updatedAt: Date;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
