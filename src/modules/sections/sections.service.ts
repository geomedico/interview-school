import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SectionEntity } from './../../postgres/pg-models/section.entity';
import { PDFService } from '../pdf/pdf.service';
import { CreateSectionDto } from './DTO/create-section.dto';
import { TeacherService } from './../teachers/teacher.service';
import { SubjectService } from './../subjects/subject.service';
import { ClassroomService } from './../classrooms/classroom.service';
import { StudentService } from './../students/student.service';
import { DaysOfWeek } from './../../common/enums';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(SectionEntity)
    private sectionRepository: Repository<SectionEntity>,
    private readonly teacherService: TeacherService,
    private readonly subjectService: SubjectService,
    private readonly classroomService: ClassroomService,
    private readonly studentService: StudentService,
    private readonly pdfService: PDFService,
  ) {}

  async createSection(
    createSectionDto: CreateSectionDto,
  ): Promise<SectionEntity> {
    try {
      const {
        teacherId,
        subjectId,
        classroomId,
        daysOfWeek,
        startTime,
        name,
        endTime,
        studentIds = [],
      } = createSectionDto || {};

      const teacher = await this.teacherService.findById(teacherId);

      const subject = await this.subjectService.findById(subjectId);

      const classroom = await this.classroomService.findById(classroomId);

      if (!this.areValidDays(daysOfWeek)) {
        throw new BadRequestException('Invalid days of the week configuration');
      }

      let validStudents = [];
      if (studentIds && studentIds.length > 0) {
        validStudents = await this.studentService.findByIds(studentIds);
        if (validStudents.length !== studentIds.length) {
          throw new BadRequestException('One or more students not found');
        }
      }

      const section = this.sectionRepository.create({
        teacher,
        subject,
        name,
        classroom,
        daysOfWeek,
        startTime,
        endTime,
        students: validStudents,
      });

      return await this.sectionRepository.save(section);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new Error(`Error creating section: ${error.message}`);
    }
  }

  private areValidDays(daysOfWeek: DaysOfWeek[]): boolean {
    const validPatterns = [
      [DaysOfWeek.MONDAY, DaysOfWeek.WEDNESDAY, DaysOfWeek.FRIDAY],
      [DaysOfWeek.TUESDAY, DaysOfWeek.THURSDAY],
      [
        DaysOfWeek.MONDAY,
        DaysOfWeek.TUESDAY,
        DaysOfWeek.WEDNESDAY,
        DaysOfWeek.THURSDAY,
        DaysOfWeek.FRIDAY,
      ],
    ];
    return validPatterns.some(
      (pattern) =>
        pattern.length === daysOfWeek.length &&
        pattern.every((day) => daysOfWeek.includes(day)),
    );
  }

  async downLoadSchedule(studentId: string) {
    try {
      const student = await this.studentService.findById(studentId);
      const pdfBuffer = await this.pdfService.generateSchedulePDF(student);

      return pdfBuffer;
    } catch (error) {
      throw new Error(`Error downloading pdf Schedule: ${error.message}`);
    }
  }

  async enrollStudentInSection(
    studentId: string,
    sectionId: string,
  ): Promise<void> {
    try {
      const student = await this.studentService.findById(studentId);
      const section = await this.sectionRepository.findOne({
        where: { id: sectionId },
      });

      if (!section) {
        throw new NotFoundException('Section not found');
      }

      if (this.hasTimeConflict(student.sections, section)) {
        throw new ConflictException('Schedule conflict detected');
      }

      if (!section.students) {
        section.students = [];
      }

      section.students.push(student);

      await this.sectionRepository.save(section);
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new Error(`Error enrolling student: ${error.message}`);
    }
  }

  private hasTimeConflict(
    existingSections: SectionEntity[],
    newSection: SectionEntity,
  ): boolean {
    return existingSections.some((existingSection) => {
      const overlappingDays = existingSection.daysOfWeek.filter((day) =>
        newSection.daysOfWeek.includes(day),
      );

      return (
        overlappingDays.length > 0 &&
        this.isTimeOverlap(existingSection, newSection)
      );
    });
  }

  private isTimeOverlap(
    sectionA: SectionEntity,
    sectionB: SectionEntity,
  ): boolean {
    return (
      sectionA.startTime < sectionB.endTime &&
      sectionA.endTime > sectionB.startTime
    );
  }
}
