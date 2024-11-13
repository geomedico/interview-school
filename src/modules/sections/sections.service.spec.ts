import { Test, TestingModule } from '@nestjs/testing';
import { SectionsService } from './sections.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SectionEntity } from './../../postgres/pg-models/section.entity';
import { TeacherService } from './../teachers/teacher.service';
import { SubjectService } from './../subjects/subject.service';
import { ClassroomService } from './../classrooms/classroom.service';
import { StudentService } from './../students/student.service';
import { PDFService } from '../pdf/pdf.service';
import { CreateSectionDto } from './DTO/create-section.dto';
import { DaysOfWeek } from './../../common/enums';
import { BadRequestException, NotFoundException, ConflictException } from '@nestjs/common';

const mockRepository = jest.fn(() => ({
  create: jest.fn(),
  save: jest.fn(),
  findOne: jest.fn(),
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

describe('SectionsService', () => {
  let service: SectionsService;
  let sectionRepo: jest.Mocked<Repository<SectionEntity>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SectionsService,
        { provide: getRepositoryToken(SectionEntity), useFactory: mockRepository },
        { provide: TeacherService, useValue: mockTeacherService },
        { provide: SubjectService, useValue: mockSubjectService },
        { provide: ClassroomService, useValue: mockClassroomService },
        { provide: StudentService, useValue: mockStudentService },
        { provide: PDFService, useValue: mockPDFService },
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
        daysOfWeek: [DaysOfWeek.MONDAY, DaysOfWeek.WEDNESDAY, DaysOfWeek.FRIDAY],
        startTime: '08:00',
        endTime: '09:00',
        studentIds: ['student1', 'student2'],
      };

      const mockSection = {
        teacher: { id: 'teacher-id' },
        subject: { id: 'subject-id' },
        classroom: { id: 'classroom-id' },
        students: [{ id: 'student1' }, { id: 'student2' }],
        daysOfWeek: mockDto.daysOfWeek,
        startTime: mockDto.startTime,
        endTime: mockDto.endTime,
      };

      mockTeacherService.findById.mockResolvedValue({ id: 'teacher-id' });
      mockSubjectService.findById.mockResolvedValue({ id: 'subject-id' });
      mockClassroomService.findById.mockResolvedValue({ id: 'classroom-id' });
      mockStudentService.findByIds.mockResolvedValue([
        { id: 'student1' },
        { id: 'student2' },
      ]);
      sectionRepo.create.mockReturnValue(mockSection as any);
      sectionRepo.save.mockResolvedValue(mockSection as any);

      const result = await service.createSection(mockDto);

      expect(result).toEqual(mockSection);
      expect(sectionRepo.save).toHaveBeenCalledWith(expect.objectContaining(mockSection));
    });

    it('should throw an error if days of the week are invalid', async () => {
      const mockDto: CreateSectionDto = {
        teacherId: 'teacher-id',
        subjectId: 'subject-id',
        classroomId: 'classroom-id',
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

  describe('enrollStudentInSection', () => {
    it('should enroll a student into a section', async () => {
      const mockStudent = { id: 'student-id', sections: [] };
      const mockSection = { id: 'section-id', daysOfWeek: [DaysOfWeek.MONDAY] };

      mockStudentService.findById.mockResolvedValue(mockStudent);
      sectionRepo.findOne.mockResolvedValue(mockSection as any);

      await service.enrollStudentInSection('student-id', 'section-id');

      expect(sectionRepo.save).toHaveBeenCalledWith(mockStudent);
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
      expect(mockPDFService.generateSchedulePDF).toHaveBeenCalledWith(mockStudent);
    });
  });
});
