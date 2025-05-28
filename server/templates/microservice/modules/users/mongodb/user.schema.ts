import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
// <!-- IMPORTS -->

@Schema()
export class User extends Document {
    @Prop({ required: true, unique: true })
    email: string;

    @Prop({ nullable: true })
    password?: string;

    // <!-- PROPS -->
}

export const UserSchema = SchemaFactory.createForClass(User);
