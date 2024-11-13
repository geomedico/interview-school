// sections.controller.ts
import { Controller, Post, Get, Param, Body, Res } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { CreateSectionDto } from './DTO/create-section.dto';

@ApiTags('Sections')
@Controller('sections')
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a section' })
  async createSection(@Body() createSectionDto: CreateSectionDto) {
    try {
      const section =
        await this.sectionsService.createSection(createSectionDto);
      return { message: 'Section created successfully', section };
    } catch (error) {
      throw error;
    }
  }

  @Post(':sectionId/enroll')
  @ApiOperation({ summary: 'Enroll a student in a section' })
  async enrollStudent(
    @Param('sectionId') sectionId: string,
    @Body('studentId') studentId: string,
  ) {
    try {
      await this.sectionsService.enrollStudentInSection(studentId, sectionId);
      return { message: 'Enrollment successful' };
    } catch (error) {
      throw error;
    }
  }

  @Get(':studentId/pdf-schedule')
  @ApiOperation({ summary: 'Download student schedule as PDF' })
  async downloadSchedule(
    @Param('studentId') studentId: string,
    @Res() res: Response,
  ) {
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
