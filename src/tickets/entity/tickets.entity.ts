import { UserEntity } from 'src/users/entity/user.entity';
import { SessionEntity } from 'src/sessions/entity/sessions.entity';
import { TypeORMBaseEntity } from 'src/types/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';

@Entity('tickets')
export class TicketEntity extends TypeORMBaseEntity {
  @Column()
  user_id: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE', lazy: true })
  @JoinColumn({ name: 'user_id' })
  user: Promise<UserEntity>;

  @ManyToOne(() => SessionEntity, (session) => session.tickets)
  @JoinColumn({ name: 'session_id' })
  session: SessionEntity;
}
