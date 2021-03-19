import { Controller, Get, Query } from '@nestjs/common';
import { AllegroService } from '../../services/allegro/allegro.service';

@Controller('allegro')
export class SearchAllegroController {

  constructor(private allegroService: AllegroService) {
  }

  @Get()
  searchAllegro(@Query('category') category: number,  @Query('phrase') phrase: string) {
    return this.allegroService.search(category, phrase)
  }

}
