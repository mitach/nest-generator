import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
// <!-- IMPORTS -->

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  // <!-- COLUMNS -->
}
