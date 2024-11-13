import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubjectService } from './subject.service';

import { SubjectEntity } from './../../postgres/pg-models/subject.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SubjectEntity])],
  providers: [SubjectService],
  exports: [SubjectService],
})
export class SubjectModule {}
