import { Test, TestingModule } from '@nestjs/testing';
import { SearchAllegroController } from './searchAllegro.controller';

describe('SearchController', () => {
  let controller: SearchAllegroController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchAllegroController],
    }).compile();

    controller = module.get<SearchAllegroController>(SearchAllegroController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
