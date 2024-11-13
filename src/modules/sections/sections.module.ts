import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SectionsService } from './sections.service';
import { SectionsController } from './sections.controller';
import { PDFModule } from './../pdf/pdf.module';
import { SectionEntity } from './../../postgres/pg-models/section.entity';
import { TeacherModule } from './../teachers/teacher.module';
import { SubjectModule } from './../subjects/subject.module';
import { ClassroomModule } from './../classrooms/classroom.module';
import { StudentModule } from './../students/student.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([SectionEntity]),
    TeacherModule,
    SubjectModule,
    ClassroomModule,
    StudentModule,
    PDFModule
  ],
  controllers: [SectionsController],
  providers: [SectionsService],
  exports: [SectionsService],
})
export class SectionsModule {}
