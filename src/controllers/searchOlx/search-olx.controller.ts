import { Controller, Get, Query } from '@nestjs/common';
import { OlxService } from '../../services/olx/olx.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Olx Scrapper')
@Controller('olx')
export class SearchOlxController {

  constructor(private olxService: OlxService) {
  }

  @Get()
  searchOlx(@Query('phrase') phrase: string) {
    return this.olxService.search(phrase)
  }

}
