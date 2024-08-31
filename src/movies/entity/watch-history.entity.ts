import { TypeORMBaseEntity } from '../../types/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { MovieEntity } from './movies.entity';
import { UserEntity } from '../../users/entity/user.entity';

@Entity('watch_history')
export class WatchHistoryEntity extends TypeORMBaseEntity {
  @Column()
  user_id: string;

  @Column()
  movie_id: string;

  @ManyToOne(() => MovieEntity, { eager: true })
  @JoinColumn({ name: 'movie_id' })
  movie: MovieEntity;

  @ManyToOne(() => UserEntity, {
    eager: true,
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
