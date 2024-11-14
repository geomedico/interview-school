import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator';

@ValidatorConstraint({ name: 'SectionTimeConstraint', async: false })
export class SectionTimeConstraint implements ValidatorConstraintInterface {
  validate(endTime: string, args: ValidationArguments) {
    const startTime = (args.object as any).startTime;
    const duration = this.calculateDuration(startTime, endTime);

    if (duration !== 50 && duration !== 80) {
      args.constraints = [
        `Invalid duration: ${duration}. Duration must be either 50 or 80 minutes.`,
      ];
      return false;
    }

    if (!this.isWithinAllowedStartTime(startTime)) {
      args.constraints = [
        `Invalid start time: ${startTime}. Allowed start times are between 07:30 and 22:00.`,
      ];
      return false;
    }

    if (!this.isWithinAllowedEndTime(endTime)) {
      args.constraints = [
        `Invalid end time: ${endTime}. Allowed end times are between 07:30 and 22:00.`,
      ];
      return false;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments): string {
    if (!args.constraints || args.constraints.length === 0) {
      return 'Invalid time configuration for section.';
    }
    return args.constraints[0];
  }

  private calculateDuration(start: string, end: string): number {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    return (endHour - startHour) * 60 + (endMinute - startMinute);
  }

  private isWithinAllowedStartTime(startTime: string): boolean {
    const [hour, minute] = startTime.split(':').map(Number);
    return (hour > 7 || (hour === 7 && minute >= 30)) && hour <= 22; // 7:30 AM to 10:00 PM
  }

  private isWithinAllowedEndTime(endTime: string): boolean {
    const [hour, minute] = endTime.split(':').map(Number);
    return hour < 22 || (hour === 22 && minute === 0); // Latest end time is 10:00 PM
  }
}
