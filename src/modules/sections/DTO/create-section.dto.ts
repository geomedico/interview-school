import {
  IsArray,
  IsEnum,
  IsString,
  Matches,
  Validate,
  IsOptional,
} from 'class-validator';
import { DaysOfWeek } from './../../../common/enums';
import { SectionTimeConstraint } from './../validators/section-time.constraint';

export class CreateSectionDto {
  @IsString()
  @Matches(/^(0[7-9]|1[0-9]|2[0-2]):[0-5][0-9]$/, {
    message: 'Invalid start time format',
  })
  startTime: string; // e.g., "07:30", "08:00", etc.

  @IsString()
  @Matches(/^(0[7-9]|1[0-9]|2[0-2]):[0-5][0-9]$/, {
    message: 'Invalid end time format',
  })
  @Validate(SectionTimeConstraint) // Apply custom validator for duration, earliest start, and latest end time
  endTime: string;

  @IsArray()
  @IsEnum(DaysOfWeek, { each: true })
  daysOfWeek: DaysOfWeek[];

  @IsString()
  teacherId: string;

  @IsString()
  subjectId: string;

  @IsString()
  classroomId: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  studentIds?: string[];
}
