import { Test, TestingModule } from '@nestjs/testing';
import { SearchOlxController } from './search-olx.controller';

describe('SearchOlxController', () => {
  let controller: SearchOlxController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchOlxController],
    }).compile();

    controller = module.get<SearchOlxController>(SearchOlxController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
