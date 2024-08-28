import { UserEntity } from 'src/auth/entity/user.entity';
import { SessionEntity } from 'src/sessions/entity/sessions.entity';
import { TypeORMBaseEntity } from 'src/types/base.entity';
import { Entity, ManyToOne, OneToOne } from 'typeorm';

@Entity('ticket')
export class TicketEntity extends TypeORMBaseEntity {
  @ManyToOne(() => UserEntity, (user) => user.tickets, { onDelete: 'CASCADE' })
  user: UserEntity;

  @OneToOne(() => SessionEntity, (session) => session.tickets)
  session: SessionEntity;
}
