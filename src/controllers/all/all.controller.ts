import { BadRequestException, Controller, Get, Logger, Query } from '@nestjs/common';
import { AllegroService } from '../../services/allegro/allegro.service';
import { OlxService } from '../../services/olx/olx.service';
import { map, switchMap } from 'rxjs/operators';
import { PersistencePostgresService } from '../../services/persistence-postgres/persistence-postgres.service';
import { flatMap } from 'rxjs/internal/operators';
import { CombineService } from '../../services/combine/combine.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Combine')
@Controller('all')
export class AllController {

  constructor(private allegroService: AllegroService,
              private olxService: OlxService,
              private persistence: PersistencePostgresService,
              private combine: CombineService) {
  }

  @Get('search/save')
  searchAndSave(@Query('search') search: string, @Query('category') category: string = null) {
    if (!search) return new BadRequestException('Search query must be specified')
    return this.persistence.insertQuery(search).pipe(
      switchMap(queryNr => this.combine.searchAll(search, category).pipe(map(result => {
        result['queryNr'] = queryNr
        return result;
      }))),
      switchMap(result => {
        Logger.debug(`Saving ${result.data.length} offers`, AllController.name);
        // return this.persistence.insertResults(result.queryNr, result.data)
        return this.persistence.insertResults(result.queryNr, result.data)
      })
    )
  }

  @Get()
  searchAll(@Query('search') search: string, @Query('allegroCategory') allegroCategory: string) {
    if (!search) {
      Logger.debug(`searing... ${search}`);
      return new BadRequestException(`NullSearch`)
    }
    return this.combine.searchAll(search, allegroCategory);
  }

  @Get('results')
  getResult(@Query('query') query: number) {
    if (!query) return new BadRequestException('Query must be specified')
    return this.persistence.getResultsForQuery(query)
  }
}
