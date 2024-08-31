import { MovieEntity } from '../../movies/entity/movies.entity';
import { TypeORMBaseEntity } from '../../types/base/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { TimeSlot } from '../enum/time-slot';
import { TicketEntity } from '../../tickets/entity/tickets.entity';

@Entity('sessions')
export class SessionEntity extends TypeORMBaseEntity {
  @Column({ type: 'date', nullable: false })
  date: Date;

  @Column({
    type: 'enum',
    enum: TimeSlot,
    nullable: false,
  })
  timeSlot: string;

  @Column()
  roomNumber: number;

  @ManyToOne(() => MovieEntity, (movie) => movie.sessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'movie_id' })
  movie: MovieEntity;

  @OneToMany(() => TicketEntity, (ticket) => ticket.session)
  tickets: TicketEntity[];
}
