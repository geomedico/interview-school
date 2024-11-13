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

    // Validate duration is 50 or 80 minutes
    if (duration !== 50 && duration !== 80) {
      return false;
    }

    // Validate start time is no earlier than 7:30 AM
    if (!this.isWithinAllowedStartTime(startTime)) {
      return false;
    }

    // Validate end time is no later than 10:00 PM
    if (!this.isWithinAllowedEndTime(endTime)) {
      return false;
    }

    return true;
  }

  // defaultMessage(_args: ValidationArguments) {
  //   return 'Section duration must be either 50 or 80 minutes, start no earlier than 07:30 AM, and end no later than 10:00 PM.';
  // }

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
