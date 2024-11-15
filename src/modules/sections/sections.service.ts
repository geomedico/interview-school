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
import { ScheduleConflictUtil } from './../../common/schedule-conflict.util';

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
    private readonly scheduleConflictUtil: ScheduleConflictUtil,
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

      if (
        !daysOfWeek ||
        !Array.isArray(daysOfWeek) ||
        !this.scheduleConflictUtil.areValidDays(daysOfWeek)
      ) {
        throw new BadRequestException('Invalid days of the week configuration');
      }

      let validStudents = [];
      const entityPayload = { startTime, endTime, daysOfWeek } as SectionEntity;

      if (studentIds && studentIds.length > 0) {
        validStudents = await this.studentService.findByIds(studentIds);
        if (validStudents.length !== studentIds.length) {
          throw new BadRequestException('One or more students not found');
        }
      }

      const teacherSections = await this.sectionRepository.find({
        where: { teacher },
      });

      if (
        this.scheduleConflictUtil.hasTimeConflict(
          teacherSections,
          entityPayload,
        )
      ) {
        throw new ConflictException('Teacher has a scheduling conflict');
      }

      // Check for time conflicts with classroom's other sections
      const classroomSections = await this.sectionRepository.find({
        where: { classroom },
      });

      if (
        this.scheduleConflictUtil.hasTimeConflict(
          classroomSections,
          entityPayload,
        )
      ) {
        throw new ConflictException('Classroom has a scheduling conflict');
      }

      // Check for time conflicts with students' other sections
      for (const student of validStudents) {
        const studentSections = await this.sectionRepository
          .createQueryBuilder('section')
          .innerJoin('section.students', 'student')
          .where('student.id = :studentId', { studentId: student.id })
          .getMany();

        if (
          this.scheduleConflictUtil.hasTimeConflict(
            studentSections,
            entityPayload,
          )
        ) {
          throw new ConflictException(
            `Student ${student.id} has a scheduling conflict`,
          );
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
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new Error(`Error creating section: ${error.message}`);
    }
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

      if (
        this.scheduleConflictUtil.hasTimeConflict(student.sections, section)
      ) {
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
}
