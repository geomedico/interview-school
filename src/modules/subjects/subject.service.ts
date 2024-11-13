import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubjectEntity } from './../../postgres/pg-models/subject.entity';

@Injectable()
export class SubjectService {
  constructor(
    @InjectRepository(SubjectEntity)
    private readonly subjectRepository: Repository<SubjectEntity>,
  ) {}

  async findById(subjectId: string): Promise<SubjectEntity> {
    try {
      const subject = await this.subjectRepository.findOne({
        where: { id: subjectId },
      });
      if (!subject) {
        throw new NotFoundException(`Subject with ID ${subjectId} not found`);
      }
      return subject;
    } catch (error) {
      throw new Error(`Error fetching subject by ID: ${error.message}`);
    }
  }
}
