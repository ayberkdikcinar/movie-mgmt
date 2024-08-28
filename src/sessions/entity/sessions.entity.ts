import { MovieEntity } from 'src/movies/entity/movies.entity';
import { TypeORMBaseEntity } from 'src/types/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TimeSlot } from '../enum/time-slot';
import { TicketEntity } from 'src/tickets/entity/tickets.entity';

@Entity('sessions')
export class SessionEntity extends TypeORMBaseEntity {
  @Column({ nullable: false })
  date: Date;

  @Column({
    type: 'enum',
    enum: TimeSlot,
    nullable: false,
  })
  timeSlot: string;

  @Column()
  roomNumber: number;

  @Column()
  movie_id: string;

  @ManyToOne(() => MovieEntity, (movie) => movie.sessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'movie_id' })
  movie: MovieEntity;

  @OneToMany(() => TicketEntity, (ticket) => ticket.session)
  tickets: TicketEntity[];
}
