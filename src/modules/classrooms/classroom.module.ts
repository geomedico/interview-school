import { TypeOrmModule } from '@nestjs/typeorm';

import { Module } from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { ClassroomEntity } from './../../postgres/pg-models/classroom.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClassroomEntity])],
  providers: [ClassroomService],
  exports: [ClassroomService],
})
export class ClassroomModule {}
