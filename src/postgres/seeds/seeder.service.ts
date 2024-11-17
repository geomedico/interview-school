import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial } from 'typeorm';

import { TeacherEntity } from './../pg-models/teacher.entity';
import { SubjectEntity } from './../pg-models/subject.entity';
import { ClassroomEntity } from './../pg-models/classroom.entity';
import { StudentEntity } from './../pg-models/student.entity';
import { SectionEntity } from './../pg-models/section.entity';
import { DaysOfWeek } from '../../common/enums';

@Injectable()
export class SeederService {
  constructor(
    @InjectRepository(TeacherEntity)
    private readonly teacherRepo: Repository<TeacherEntity>,
    @InjectRepository(SubjectEntity)
    private readonly subjectRepo: Repository<SubjectEntity>,
    @InjectRepository(ClassroomEntity)
    private readonly classroomRepo: Repository<ClassroomEntity>,
    @InjectRepository(StudentEntity)
    private readonly studentRepo: Repository<StudentEntity>,
    @InjectRepository(SectionEntity)
    private readonly sectionRepo: Repository<SectionEntity>,
    private logger: Logger,
  ) {}

  async seed(): Promise<void> {
    try {
      const teachers = await this.seedEntities(
        this.teacherRepo,
        [
          { name: 'Dr. John Smith' },
          { name: 'Prof. Emily Johnson' },
          { name: 'Dr. Jim Beam' },
        ],
        'name',
      );

      const subjects = await this.seedEntities(
        this.subjectRepo,
        [
          { name: 'Mathematics 101' },
          { name: 'Chemistry 102' },
          { name: 'Computer Engineering 103' },
        ],
        'name',
      );

      const classrooms = await this.seedEntities(
        this.classroomRepo,
        [
          { roomNumber: '101A' },
          { roomNumber: '102B' },
          { roomNumber: '103C' },
        ],
        'roomNumber',
      );

      const students = await this.seedEntities(
        this.studentRepo,
        [
          { name: 'Alice' },
          { name: 'Bob' },
          { name: 'Charlie' },
          { name: 'Mike' },
        ],
        'name',
      );

      const sectionPayload = [
        {
          startTime: '08:00',
          endTime: '08:50',
          name: 'section #1',
          daysOfWeek: [
            DaysOfWeek.MONDAY,
            DaysOfWeek.WEDNESDAY,
            DaysOfWeek.FRIDAY,
          ],
          teacher: teachers[0],
          subject: subjects[0],
          classroom: classrooms[0],
          students: [students[0], students[1]],
        },
        {
          startTime: '09:00',
          endTime: '09:50',
          name: 'section #2',
          daysOfWeek: [DaysOfWeek.TUESDAY, DaysOfWeek.THURSDAY],
          teacher: teachers[1],
          subject: subjects[1],
          classroom: classrooms[1],
          students: [students[1], students[2]],
        },
      ] as SectionEntity[];

      for (const section of sectionPayload) {
        const exists = await this.sectionRepo.findOne({
          where: {
            startTime: section.startTime,
            endTime: section.endTime,
            teacher: section.teacher,
            subject: section.subject,
            classroom: section.classroom,
          },
        });

        if (!exists) {
          await this.sectionRepo.save(section);
        }
      }

      console.log('Database seeding completed successfully.');
    } catch (e) {
      this.logger.error(e);
    }
  }

  private async seedEntities<T>(
    repo: Repository<T>,
    entities: DeepPartial<T>[],
    uniqueField: keyof T,
  ): Promise<T[]> {
    const savedEntities: T[] = [];

    for (const entity of entities) {
      const exists = await repo.findOne({
        where: { [uniqueField]: entity[uniqueField] },
      });

      if (!exists) {
        const saved = await repo.save(entity);
        savedEntities.push(saved);
      } else {
        savedEntities.push(exists);
      }
    }

    return savedEntities;
  }
}
