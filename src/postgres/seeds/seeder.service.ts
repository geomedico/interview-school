import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { DaysOfWeek } from '../../common/enums';

import { Repository } from 'typeorm';
import { TeacherEntity } from './../pg-models/teacher.entity';
import { SubjectEntity } from './../pg-models/subject.entity';
import { ClassroomEntity } from './../pg-models/classroom.entity';
import { StudentEntity } from './../pg-models/student.entity';
import { SectionEntity } from './../pg-models/section.entity';

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
      const teachers = await this.teacherRepo.save([
        { name: 'Dr. John Smith' },
        { name: 'Prof. Emily Johnson' },
      ]);

      // Step 2: Seed SubjectEntitys
      const subjects = await this.subjectRepo.save([
        { name: 'Mathematics 101' },
        { name: 'Chemistry 101' },
      ]);

      // Step 3: Seed ClassroomEntitys
      const classrooms = await this.classroomRepo.save([
        { roomNumber: '101A' },
        { roomNumber: '102B' },
      ]);

      // Step 4: Seed StudentEntitys
      const students = await this.studentRepo.save([
        { name: 'Alice' },
        { name: 'Bob' },
        { name: 'Charlie' },
      ]);

      // Step 5: Seed SectionEntitys
      const sectionPayload = [
        {
          startTime: '08:00',
          endTime: '08:50',
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
          daysOfWeek: [DaysOfWeek.THURSDAY, DaysOfWeek.THURSDAY],
          teacher: teachers[1],
          subject: subjects[1],
          classroom: classrooms[1],
          students: [students[1], students[2]],
        },
      ] as unknown as SectionEntity[];

      await this.sectionRepo.save(sectionPayload);

      console.log('Database seeding completed successfully.');
    } catch (e) {
      this.logger.error(e);
    }
  }
}
