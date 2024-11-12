import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
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
  startTime: string; // E.g., "07:30"

  @Column()
  endTime: string; // E.g., "08:20" or "09:50"

  @Column({
    type: 'enum',
    enum: DaysOfWeek,
    default: DaysOfWeek.MONDAY,
  })
  daysOfWeek: DaysOfWeek;

  @ManyToOne(() => TeacherEntity, (teacher) => teacher.sections)
  @JoinColumn()
  teacher: TeacherEntity;

  @ManyToOne(() => SubjectEntity, (subject) => subject.sections)
  @JoinColumn()
  subject: SubjectEntity;

  @ManyToOne(() => ClassroomEntity, (classroom) => classroom.sections)
  @JoinColumn()
  classroom: ClassroomEntity;

  @ManyToMany(() => StudentEntity, (student) => student.sections)
  @JoinTable()
  students: StudentEntity[];
}
