import { Injectable } from '@nestjs/common';

import { SectionEntity } from './../../postgres/pg-models/section.entity';
import { DaysOfWeek } from './../enums';

@Injectable()
export class ScheduleConflictUtil {
  public parseTime(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 100 + minutes;
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
      throw new Error('Start time or end time is undefined in new section');
    }

    const newSectionStartTime = this.parseTime(newSection.startTime);
    const newSectionEndTime = this.parseTime(newSection.endTime);

    return existingSections?.some((section) => {
      if (!section.startTime || !section.endTime) {
        return false;
      }

      const sectionStartTime = this.parseTime(section.startTime);
      const sectionEndTime = this.parseTime(section.endTime);

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
