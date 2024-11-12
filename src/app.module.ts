import { Module, Logger } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ConfigsModule } from './common/config.module';
import { DbPgModule } from './postgres/db-pg.module';
import { ClassroomEntity } from './postgres/pg-models/classroom.entity';
import { SectionEntity } from './postgres/pg-models/section.entity';
import { StudentEntity } from './postgres/pg-models/student.entity';
import { SubjectEntity } from './postgres/pg-models/subject.entity';
import { TeacherEntity } from './postgres/pg-models/teacher.entity';

import { SeederService } from './postgres/seeds/seeder.service';
// import { CompanyModule } from './company/company.module';
// import { InvestmentModule } from './investment/investment.module';

@Module({
  imports: [
    ConfigsModule,
    DbPgModule,
    TypeOrmModule.forFeature([
      ClassroomEntity,
      SectionEntity,
      StudentEntity,
      SubjectEntity,
      TeacherEntity,
    ]),
    // CompanyModule,
    // InvestmentModule
  ],
  providers: [SeederService, Logger],
})
export class AppModule {}
