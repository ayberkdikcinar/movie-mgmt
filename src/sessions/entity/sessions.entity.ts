import { MovieEntity } from 'src/movies/entity/movies.entity';
import { TypeORMBaseEntity } from 'src/types/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { TimeSlot } from '../enum/time-slot';
import { TicketEntity } from 'src/tickets/entity/tickets.entity';

@Entity('session')
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

  @ManyToOne(() => MovieEntity, (movie) => movie.sessions, {
    onDelete: 'CASCADE',
  })
  movie: MovieEntity;

  @OneToMany(() => TicketEntity, (ticket) => ticket.session)
  tickets: TicketEntity[];
}
