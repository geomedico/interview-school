import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { SectionEntity } from './section.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class StudentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column()
  name: string;

  @ManyToMany(() => SectionEntity, (section) => section.students)
  @JoinTable()
  sections: SectionEntity[];
}
