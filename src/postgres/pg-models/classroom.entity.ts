import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SectionEntity } from './section.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class ClassroomEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column()
  roomNumber: string;

  @OneToMany(() => SectionEntity, (section) => section.classroom)
  sections: SectionEntity[];
}
