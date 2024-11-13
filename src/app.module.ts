import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigsModule } from './common/config.module';
import { ClassroomEntity } from './postgres/pg-models/classroom.entity';
import { SectionEntity } from './postgres/pg-models/section.entity';
import { StudentEntity } from './postgres/pg-models/student.entity';
import { SubjectEntity } from './postgres/pg-models/subject.entity';
import { TeacherEntity } from './postgres/pg-models/teacher.entity';

import { SeederService } from './postgres/seeds/seeder.service';
import { DbPgModule } from './postgres/db-pg.module';

import { ClassroomModule } from './modules/classrooms/classroom.module';
import { TeacherModule } from './modules/teachers/teacher.module';
import { SubjectModule } from './modules/subjects/subject.module';
import { SectionsModule } from './modules/sections/sections.module';
import { StudentModule } from './modules/students/student.module';

@Module({
  imports: [
    ConfigsModule,
    DbPgModule,
    TypeOrmModule.forFeature([
      ClassroomEntity,
      SectionEntity,
      StudentEntity,
      SubjectEntity,
      TeacherEntity,
    ]),
    ClassroomModule,
    TeacherModule,
    TeacherModule,
    SubjectModule,
    SectionsModule,
    StudentModule,
  ],
  providers: [SeederService, Logger],
})
export class AppModule {}
