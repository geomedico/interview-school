import { Module } from '@nestjs/common';
import { ScheduleConflictUtil } from './schedule-conflict.util';

@Module({
  providers: [ScheduleConflictUtil], 
  exports: [ScheduleConflictUtil],  
})
export class UtilsModule {}
