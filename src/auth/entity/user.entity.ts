import { TicketEntity } from 'src/tickets/entity/tickets.entity';
import { TypeORMBaseEntity } from 'src/types/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../enum/role';

@Entity('user')
export class UserEntity extends TypeORMBaseEntity {
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column()
  age: number;

  @Column({ type: 'enum', enum: Role })
  role: Role;

  @OneToMany(() => TicketEntity, (ticket) => ticket.user)
  tickets: TicketEntity[];
}
