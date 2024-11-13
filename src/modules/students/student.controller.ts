import { Controller, Get, Param } from '@nestjs/common';
import { StudentService } from './student.service';

@Controller('students')
export class StudentController {
  constructor(private readonly studentService: StudentService) {}

  @Get(':id')
  async getStudentWithSections(@Param('id') studentId: string) {
    return this.studentService.findById(studentId);
  }
}
