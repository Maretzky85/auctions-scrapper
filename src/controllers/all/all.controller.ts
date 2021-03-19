import { Controller, Get, Logger, Query } from '@nestjs/common';
import { AllegroService } from '../../services/allegro/allegro.service';
import { OlxService } from '../../services/olx/olx.service';
import { map, switchMap } from 'rxjs/operators';
import { PersistencePostgresService } from '../../services/persistence-postgres/persistence-postgres.service';
import { flatMap } from 'rxjs/internal/operators';
import { Offer } from '../../models/offer';
import { CombineService } from '../../services/combine/combine.service';

@Controller('all')
export class AllController {

  constructor(private allegroService: AllegroService,
              private olxService: OlxService,
              private persistence: PersistencePostgresService,
              private combine: CombineService) {
  }

  @Get('ss')
  searchAndSave(@Query('search') search: string) {
    Logger.log(`Creating new query ${search}`)
    return this.persistence.insertQuery(search).pipe(
      switchMap(queryNr => this.searchAll(search).pipe(map(result => {
        result['queryNr'] = queryNr
        return result;
      }))),
      flatMap(result => {
        Logger.log(`Saving ${result.data.length} offers`, AllController.name);
        // @ts-ignore
        return this.persistence.insertResults(result.queryNr, result.data)
      })
    )
  }

  @Get()
  searchAll(@Query('search') search: string) {
    return this.combine.searchAll(search);
  }

  @Get('results')
  getResult(@Query('query') query: number) {
    return this.persistence.getResultsForQuery(query).pipe(
      map(results =>
      results.map(result => {
        return {
          id: result[0],
          img: JSON.parse(result[1]),
          title: result[2],
          url: result[3],
          vendorId: result[6],
          price: result[4],
          location: result[5]
        } as Offer
      }))
    );
  }
}
