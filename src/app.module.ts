import { HttpModule, Logger, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SearchAllegroController } from './controllers/searchAllegro/searchAllegro.controller';
import { SearchOlxController } from './controllers/searchOlx/search-olx.controller';
import { AllegroService } from './services/allegro/allegro.service';
import { OlxService } from './services/olx/olx.service';
import { AllController } from './controllers/all/all.controller';
import { PersistencePostgresService } from './services/persistence-postgres/persistence-postgres.service';
import { JobsController } from './controllers/jobs/jobs.controller';
import { CombineService } from './services/combine/combine.service';

@Module({
  imports: [HttpModule],
  controllers: [AppController, SearchAllegroController, SearchOlxController, AllController, JobsController],
  providers: [AppService, AllegroService, OlxService, Logger, PersistencePostgresService, CombineService],
})
export class AppModule {}
