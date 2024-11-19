import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  Res,
} from '@nestjs/common';
import { SectionsService } from './sections.service';
import { ApiOperation, ApiTags, ApiBody, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateSectionDto } from './DTO/create-section.dto';
import { IResponse } from './../../common/interfaces';
import { DaysOfWeek } from './../../common/enums';

@ApiTags('Sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a section' })
  @ApiBody({
    description: 'The section details to create',
    schema: {
      example: {
        teacherId: 'teacher-id',
        subjectId: 'subject-id',
        classroomId: 'classroom-id',
        name: 'Section Name',
        daysOfWeek: [
          DaysOfWeek.MONDAY,
          DaysOfWeek.WEDNESDAY,
          DaysOfWeek.FRIDAY,
        ],
        startTime: '08:00',
        endTime: '08:50',
        studentIds: ['student1', 'student2'],
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Section created successfully',
    schema: {
      example: {
        status: 1,
        message: 'Section created successfully',
        data: {
          id: 'section-id',
          name: 'Section Name',
          teacherId: 'teacher-id',
          classroomId: 'classroom-id',
          daysOfWeek: [
            DaysOfWeek.MONDAY,
            DaysOfWeek.WEDNESDAY,
            DaysOfWeek.FRIDAY,
          ],
          startTime: '08:00',
          endTime: '08:50',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    schema: {
      example: {
        status: 0,
        message: 'Invalid days of the week configuration',
      },
    },
  })
  async createSection(
    @Body() createSectionDto: CreateSectionDto,
  ): Promise<IResponse> {
    try {
      const section =
        await this.sectionsService.createSection(createSectionDto);
      return {
        status: 1,
        message: 'Section created successfully',
        data: section,
      };
    } catch (error) {
      return {
        message: error.message || 'An error occurred - Section creation ',
      };
    }
  }

  @Post(':sectionId/enroll')
  @ApiOperation({ summary: 'Enroll a student in a section' })
  async enrollStudent(
    @Param('sectionId') sectionId: string,
    @Body('studentId') studentId: string,
  ): Promise<IResponse> {
    try {
      await this.sectionsService.enrollStudentInSection(studentId, sectionId);
      return { status: 1, message: 'Enrollment successful' };
    } catch (error) {
      return {
        message: error.message || 'An error occurred - Student enrollment',
      };
    }
  }

  @Delete(':sectionId/students/:studentId')
  @ApiOperation({ summary: 'Release a student from the section' })
  async releaseStudentFromSection(
    @Param('sectionId') sectionId: string,
    @Param('studentId') studentId: string,
  ): Promise<IResponse> {
    try {
      await this.sectionsService.releaseStudentFromSection(
        studentId,
        sectionId,
      );

      return { status: 1, message: 'Release successful' };
    } catch (error) {
      return {
        message: error.message || 'An error occurred - Student release',
      };
    }
  }

  @Get(':studentId/pdf-schedule')
  @ApiOperation({ summary: 'Download student schedule as PDF' })
  async downloadSchedule(
    @Param('studentId') studentId: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const pdfBuffer = await this.sectionsService.downLoadSchedule(studentId);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="schedule-${studentId}.pdf"`,
      });
      res.send(pdfBuffer);
    } catch (error) {
      throw error;
    }
  }
}
