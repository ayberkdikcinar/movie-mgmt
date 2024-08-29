import { SessionEntity } from 'src/sessions/entity/sessions.entity';
import { TypeORMBaseEntity } from 'src/types/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('watch_history')
export class WatchHistoryEntity extends TypeORMBaseEntity {
  @Column()
  user_id: string;

  @Column()
  movie_id: string;
}
