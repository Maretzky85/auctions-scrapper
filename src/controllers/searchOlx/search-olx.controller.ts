import { Controller, Get, HttpService, Query } from '@nestjs/common';
import { OlxService } from '../../services/olx/olx.service';

@Controller('olx')
export class SearchOlxController {

  constructor(private olxService: OlxService) {
  }

  @Get()
  searchOlx(@Query('phrase') phrase: string) {
    return this.olxService.searchOlx(phrase)
  }

}
