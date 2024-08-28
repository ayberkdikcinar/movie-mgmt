import { SessionEntity } from 'src/sessions/entity/sessions.entity';
import { TypeORMBaseEntity } from 'src/types/base.entity';
import { Column, Entity, OneToMany } from 'typeorm';

@Entity('movie')
export class MovieEntity extends TypeORMBaseEntity {
  @Column({ nullable: false })
  name: string;

  @Column()
  ageRestriction: number;

  @OneToMany(() => SessionEntity, (session) => session.movie)
  sessions: SessionEntity[];
}
