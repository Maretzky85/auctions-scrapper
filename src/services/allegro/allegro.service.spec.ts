import { Test, TestingModule } from '@nestjs/testing';
import { AllegroService } from './allegro.service';

describe('AllegroService', () => {
  let service: AllegroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllegroService],
    }).compile();

    service = module.get<AllegroService>(AllegroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
