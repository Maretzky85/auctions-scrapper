import { BadRequestException, Controller, Get, InternalServerErrorException, Logger, Query } from '@nestjs/common';
import { AllegroService } from '../../services/allegro/allegro.service';
import { catchError, tap } from 'rxjs/operators';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Allegro Scrapper')
@Controller('allegro')
export class SearchAllegroController {

  constructor(private allegroService: AllegroService) {
  }

  @Get()
  searchAllegro(@Query('category') category: string,  @Query('search') phrase: string) {
    if (!phrase) {
      return new BadRequestException('NullSearch')
    }
    return this.allegroService.search(phrase, category).pipe(tap(response => Logger.log(`Found ${response.length} results`)))
  }

  @Get('categories')
  getCategories() {
    return this.allegroService.getCategoryList()
      .pipe(
        catchError((err) => {
          throw new InternalServerErrorException({ status: err.response.status, statusText: err.response.statusText }, err.message);
        })
      );
  }

  @Get('search-category')
  getMatchingCategory(@Query('search') search: string) {
    if (!search) {
      return new BadRequestException('NullSearch')
    }
    return this.allegroService.getPredictedCategoryForSearch(search)
  }

  @Get('search')
  searchForProducts(@Query('search') search: string) {
    if (!search) {
      return new BadRequestException('NullSearch')
    }
    return this.allegroService.search(search)
  }

}
