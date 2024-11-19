import { Injectable } from '@nestjs/common';

import { SectionEntity } from './../../postgres/pg-models/section.entity';
import { DaysOfWeek } from './../enums';

@Injectable()
export class ScheduleConflictUtil {

  public convertToDate(time: string): Date {

    const dateString = new Date().toISOString().split('T').slice(0, 1).join('');
    const date = new Date(`${dateString}T${time}:00`);

    return date;
  }

  public hasTimeConflict(
    existingSections: SectionEntity[],
    newSection: SectionEntity,
  ): boolean {
    const comparator = {
      isOverlapping: false,
      overlappingDays: false,
      validate: function (): boolean {
        const a = this.overlappingDays;
        const b = this.isOverlapping;

        return (a && b) || (!a && b);
      },
    };

    if (!newSection.startTime || !newSection.endTime) {
      throw new Error('Start time or end time is undefined in the new section');
    }

    const newSectionStartTime = newSection.startTime.getTime(); 
    const newSectionEndTime = newSection.endTime.getTime();

    const durationMs = newSectionEndTime - newSectionStartTime;
    const allowedDurationsMs = [50 * 60 * 1000, 80 * 60 * 1000];

    if (!allowedDurationsMs.includes(durationMs)) {
      throw new Error(
        'Invalid section duration. Duration must be either 50 or 80 minutes.',
      );
    }

    return existingSections?.some((section) => {
      if (!section.startTime || !section.endTime) {
        return false;
      }

      const sectionStartTime = section.startTime.getTime();
      const sectionEndTime = section.endTime.getTime();

      comparator.overlappingDays = newSection?.daysOfWeek?.some((day) =>
        section?.daysOfWeek?.includes(day),
      );

      comparator.isOverlapping =
        (newSectionStartTime >= sectionStartTime &&
          newSectionStartTime < sectionEndTime) ||
        (newSectionEndTime > sectionStartTime &&
          newSectionEndTime <= sectionEndTime) ||
        (sectionStartTime >= newSectionStartTime &&
          sectionEndTime <= newSectionEndTime);

      return comparator.validate();
    });
  }

  public areValidDays(daysOfWeek: DaysOfWeek[]): boolean {
    const validPatterns = [
      [DaysOfWeek.MONDAY, DaysOfWeek.WEDNESDAY, DaysOfWeek.FRIDAY],
      [DaysOfWeek.TUESDAY, DaysOfWeek.THURSDAY],
      [
        DaysOfWeek.MONDAY,
        DaysOfWeek.TUESDAY,
        DaysOfWeek.WEDNESDAY,
        DaysOfWeek.THURSDAY,
        DaysOfWeek.FRIDAY,
      ],
    ];
    return validPatterns.some(
      (pattern) =>
        pattern.length === daysOfWeek.length &&
        pattern.every((day) => daysOfWeek.includes(day)),
    );
  }
}
