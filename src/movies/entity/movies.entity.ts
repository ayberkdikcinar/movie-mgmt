import { SessionEntity } from '../../sessions/entity/sessions.entity';
import { TypeORMBaseEntity } from '../../types/base/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('movies')
export class MovieEntity extends TypeORMBaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column()
  ageRestriction: number;

  @OneToMany(() => SessionEntity, (session) => session.movie)
  sessions: SessionEntity[];
}
