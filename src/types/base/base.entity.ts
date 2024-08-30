import { BaseEntity, Column, PrimaryColumn } from 'typeorm';

export class TypeORMBaseEntity {
  @PrimaryColumn()
  id: string;

  @Column()
  updatedAt: Date;

  @Column()
  createdAt: Date;
}
