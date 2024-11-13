import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentEntity } from './../../postgres/pg-models/student.entity';

@Injectable()
export class StudentService {
  constructor(
    @InjectRepository(StudentEntity)
    private readonly studentRepository: Repository<StudentEntity>,
  ) {}

  async findById(studentId: string): Promise<StudentEntity> {
    try {
      const student = await this.studentRepository.findOne({
        where: { id: studentId },
        relations: ['sections'],
      });
      if (!student) {
        throw new NotFoundException(`Student with ID ${studentId} not found`);
      }
      return student;
    } catch (error) {
      throw new Error(`Error fetching student by ID: ${error.message}`);
    }
  }

  async findByIds(studentIds: string[]): Promise<StudentEntity[]> {
    try {
      return await this.studentRepository.findByIds(studentIds);
    } catch (error) {
      throw new Error(`Error fetching students by IDs: ${error.message}`);
    }
  }
}
