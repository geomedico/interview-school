import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { SectionsService } from './sections.service';

import { SectionEntity } from './../../postgres/pg-models/section.entity';
import { TeacherService } from './../teachers/teacher.service';
import { SubjectService } from './../subjects/subject.service';
import { ClassroomService } from './../classrooms/classroom.service';
import { StudentService } from './../students/student.service';
import { PDFService } from '../pdf/pdf.service';

import { CreateSectionDto } from './DTO/create-section.dto';
import { ScheduleConflictUtil } from './../../common/schedule-conflict.util';
import { DaysOfWeek } from './../../common/enums';

const mockRepository = jest.fn(() => ({
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn().mockReturnValue({
    innerJoin: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    getMany: jest.fn(),
  }),
}));

const mockTeacherService = {
  findById: jest.fn(),
};

const mockSubjectService = {
  findById: jest.fn(),
};

const mockClassroomService = {
  findById: jest.fn(),
};

const mockStudentService = {
  findById: jest.fn(),
  findByIds: jest.fn(),
};

const mockPDFService = {
  generateSchedulePDF: jest.fn(),
};

const mockScheduleConflictUtil = {
  parseTime: jest.fn(),
  hasTimeConflict: jest.fn(),
  areValidDays: jest.fn((daysOfWeek) => {
    // Mocking the real logic to validate days
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
  }),
};

describe('SectionsService', () => {
  let service: SectionsService;
  let sectionRepo: jest.Mocked<Repository<SectionEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionsService,
        {
          provide: getRepositoryToken(SectionEntity),
          useFactory: mockRepository,
        },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: SubjectService, useValue: mockSubjectService },
        { provide: ClassroomService, useValue: mockClassroomService },
        { provide: StudentService, useValue: mockStudentService },
        { provide: PDFService, useValue: mockPDFService },
        { provide: ScheduleConflictUtil, useValue: mockScheduleConflictUtil },
      ],
    }).compile();

    service = module.get<SectionsService>(SectionsService);
    sectionRepo = module.get<jest.Mocked<Repository<SectionEntity>>>(
      getRepositoryToken(SectionEntity),
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createSection', () => {
    it('should create and return a section', async () => {
      const mockDto: CreateSectionDto = {
        teacherId: 'teacher-id',
        subjectId: 'subject-id',
        classroomId: 'classroom-id',
        name: 'Section #test',
        daysOfWeek: [
          DaysOfWeek.MONDAY,
          DaysOfWeek.WEDNESDAY,
          DaysOfWeek.FRIDAY,
        ],
        startTime: '08:00',
        endTime: '09:00',
        studentIds: ['student1', 'student2'],
      };

      const mockSection = {
        ...mockDto,
        teacher: { id: 'teacher-id' },
        subject: { id: 'subject-id' },
        classroom: { id: 'classroom-id' },
        students: [{ id: 'student1' }, { id: 'student2' }],
      };

      mockTeacherService.findById.mockResolvedValue({ id: 'teacher-id' });
      mockSubjectService.findById.mockResolvedValue({ id: 'subject-id' });
      mockClassroomService.findById.mockResolvedValue({ id: 'classroom-id' });
      mockStudentService.findByIds.mockResolvedValue([
        { id: 'student1' },
        { id: 'student2' },
      ]);

      sectionRepo.find.mockImplementation((options: any) => {
        // Handle teacher conflict
        if (options.where?.teacher) {
          return Promise.resolve([]);
        }
        if (options.where?.classroom) {
          return Promise.resolve([]);
        }
        if (options.where?.students) {
          return Promise.resolve([]);
        }
        return Promise.resolve([]);
      });
      sectionRepo.find.mockResolvedValue([]);
      sectionRepo.create.mockReturnValue(mockSection as any);
      sectionRepo.save.mockResolvedValue(mockSection as any);

      const result = await service.createSection(mockDto);

      expect(result).toEqual(mockSection);
      expect(sectionRepo.save).toHaveBeenCalledWith(
        expect.objectContaining(mockSection),
      );
    });

    it('should throw an error if days of the week are invalid', async () => {
      const mockDto: CreateSectionDto = {
        teacherId: 'teacher-id',
        subjectId: 'subject-id',
        classroomId: 'classroom-id',
        name: 'Computer Engineering',
        daysOfWeek: [DaysOfWeek.SUNDAY],
        startTime: '08:00',
        endTime: '09:00',
        studentIds: [],
      };

      await expect(service.createSection(mockDto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('releaseStudentFromSection', () => {
    it('should release a student from a section', async () => {
      const mockSection = {
        id: 'section-id',
        students: [{ id: 'student-id' }],
      };

      const mockStudent = { id: 'student-id' };

      sectionRepo.findOne.mockResolvedValue(mockSection as any);
      mockStudentService.findById.mockResolvedValue(mockStudent);

      await service.releaseStudentFromSection('student-id', 'section-id');

      expect(sectionRepo.save).toHaveBeenCalledWith({
        id: 'section-id',
        students: [],
      });
    });

    it('should throw NotFoundException if section does not exist', async () => {
      sectionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.releaseStudentFromSection('student-id', 'section-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if student is not in the section', async () => {
      const mockSection = {
        id: 'section-id',
        students: [{ id: 'another-student-id' }],
      };

      sectionRepo.findOne.mockResolvedValue(mockSection as any);

      await expect(
        service.releaseStudentFromSection('student-id', 'section-id'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('enrollStudentInSection', () => {
    it('should enroll a student into a section', async () => {
      const mockStudent = { id: 'student-id', sections: [] };
      const mockSection = {
        id: 'section-id',
        daysOfWeek: [DaysOfWeek.MONDAY],
        startTime: '08:00',
        endTime: '09:20',
        students: [],
      };

      mockStudentService.findById.mockResolvedValue(mockStudent);
      sectionRepo.findOne.mockResolvedValue(mockSection as any);

      await service.enrollStudentInSection('student-id', 'section-id');

      expect(sectionRepo.save).toHaveBeenCalledWith(mockSection);
    });

    it('should throw NotFoundException if section does not exist', async () => {
      mockStudentService.findById.mockResolvedValue({ id: 'student-id' });
      sectionRepo.findOne.mockResolvedValue(null);

      await expect(
        service.enrollStudentInSection('student-id', 'section-id'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('downLoadSchedule', () => {
    it('should return a PDF buffer for a student', async () => {
      const mockStudent = { id: 'student-id' };
      const mockBuffer = Buffer.from('PDF content');

      mockStudentService.findById.mockResolvedValue(mockStudent);
      mockPDFService.generateSchedulePDF.mockResolvedValue(mockBuffer);

      const result = await service.downLoadSchedule('student-id');

      expect(result).toEqual(mockBuffer);
      expect(mockPDFService.generateSchedulePDF).toHaveBeenCalledWith(
        mockStudent,
      );
    });
  });
});
