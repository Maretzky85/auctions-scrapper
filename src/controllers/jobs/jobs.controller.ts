import { Controller, Get, Logger, Query } from '@nestjs/common';
import {
  ActiveQuery,
  PersistencePostgresService,
} from '../../services/persistence-postgres/persistence-postgres.service';
import { first } from 'rxjs/operators';
import { CombineService } from '../../services/combine/combine.service';
import { flatMap } from 'rxjs/internal/operators';
import Timeout = NodeJS.Timeout;
import { Observable, of } from 'rxjs';
import { ApiTags } from '@nestjs/swagger';

interface Intervals {
  [id: number]: Timeout
}

@ApiTags('Jobs manager')
@Controller('jobs')
export class JobsController {

  private activeJobs: ActiveQuery[];
  private intervals: Intervals = {};
  private intervalTime: number = 1000 * 60 * 30;

  constructor(private combine: CombineService,
              private persistence: PersistencePostgresService) {
    this.init();
  }

  @Get()
  getJobs() {
    return this.persistence.getJobs();
  }

  private init() {
     this.persistence.getJobs().subscribe((jobs) => {
      Logger.debug(`loaded jobs: ${jobs.length}`)
      jobs.forEach(job => {
        job.active === true ? this.intervals[job.id] = this.registerJob(job.search, 1000 * 60 * 30, job.id) : undefined;
      });
      Logger.log(`registered ${Object.keys(this.intervals).length} jobs`);
      this.activeJobs = jobs;
    });
  }

  private registerJob(search: string, interval: number, query: number) {
    return setInterval(() => {
      this.combine.searchAll(search).pipe(
        flatMap(result => this.persistence.insertResults(query, result.data)),
        first()
      ).subscribe()
    }, interval);
  }

  @Get('deactivate')
  setInactive(@Query('queryId') queryId: number): Observable<number> {
    if (this.intervals[queryId]) {
      return this.persistence.updateQuery(queryId, false).pipe(
        flatMap(() => {
          clearInterval(this.intervals[queryId]);
          delete this.intervals[queryId];
          Logger.debug(`Query nr ${queryId} set as Inactive`);
          Logger.debug(`Active queries : ${Object.keys(this.intervals).length}`);
          return of(queryId)
        })
      )
    }
    return of(-1)
  }

  @Get('activate')
  setActive(@Query('queryId') queryId: number): Observable<number> {
    if (!this.intervals[queryId] && this.activeJobs.filter(value => value.id == queryId).length === 1) {
      return this.persistence.updateQuery(queryId, true).pipe(
        flatMap(() => {
          const query = this.activeJobs.filter(value => value.id == queryId)[0];
          this.intervals[query.id] = this.registerJob(query.search, this.intervalTime, query.id)
          Logger.debug(`Query nr ${queryId} set as Active`);
          Logger.debug(`Active queries : ${Object.keys(this.intervals).length}`);
          return of(queryId);
        })
      )
    }
    return of(-1)
  }

}
