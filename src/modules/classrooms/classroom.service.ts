// src/classrooms/classroom.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassroomEntity } from './../../postgres/pg-models/classroom.entity';

@Injectable()
export class ClassroomService {
  constructor(
    @InjectRepository(ClassroomEntity)
    private readonly classroomRepository: Repository<ClassroomEntity>,
  ) {}

  async findById(classroomId: string): Promise<ClassroomEntity> {
    try {
      const classroom = await this.classroomRepository.findOne({
        where: { id: classroomId },
      });
      if (!classroom) {
        throw new NotFoundException(
          `Classroom with ID ${classroomId} not found`,
        );
      }
      return classroom;
    } catch (error) {
      throw new Error(`Error fetching classroom by ID: ${error.message}`);
    }
  }

  async findByIds(classroomIds: string[]): Promise<ClassroomEntity[]> {
    try {
      return await this.classroomRepository.findByIds(classroomIds);
    } catch (error) {
      throw new Error(`Error fetching classrooms by IDs: ${error.message}`);
    }
  }
}
