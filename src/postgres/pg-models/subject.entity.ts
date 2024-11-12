import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { SectionEntity } from './section.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity()
export class SubjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string = uuidv4();

  @Column()
  name: string;

  @OneToMany(() => SectionEntity, (section) => section.subject)
  sections: SectionEntity[];
}
