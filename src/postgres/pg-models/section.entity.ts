import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  Index,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { DaysOfWeek } from './../../common/enums';

import { TeacherEntity } from './teacher.entity';
import { SubjectEntity } from './subject.entity';
import { ClassroomEntity } from './classroom.entity';
import { StudentEntity } from './student.entity';

@Entity()
export class SectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column()
  name: string;

  @Column({ type: 'timestamp' })
  startTime: Date;

  @Column({ type: 'timestamp' })
  endTime: Date;

  @Column({
    type: 'enum',
    array: true,
    enum: DaysOfWeek,
    default: [],
  })
  daysOfWeek: DaysOfWeek[];

  @ManyToOne(() => TeacherEntity, (teacher) => teacher.sections, {
    onDelete: 'CASCADE',
  })
  @Index()
  @JoinColumn()
  teacher: TeacherEntity;

  @ManyToOne(() => SubjectEntity, (subject) => subject.sections, {
    onDelete: 'CASCADE',
  })
  @Index()
  @JoinColumn()
  subject: SubjectEntity;

  @ManyToOne(() => ClassroomEntity, (classroom) => classroom.sections, {
    onDelete: 'CASCADE',
  })
  @Index()
  @JoinColumn()
  classroom: ClassroomEntity;

  @ManyToMany(() => StudentEntity, (student) => student.sections)
  @JoinTable()
  students: StudentEntity[];
}
