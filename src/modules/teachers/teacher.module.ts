import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TeacherService } from './teacher.service';
import { TeacherEntity } from './../../postgres/pg-models/teacher.entity';


@Module({
  imports: [TypeOrmModule.forFeature([TeacherEntity])],
  providers: [TeacherService],
  exports: [TeacherService],
})
export class TeacherModule {}
