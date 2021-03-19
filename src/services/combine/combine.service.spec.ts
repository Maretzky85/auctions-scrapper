import { Test, TestingModule } from '@nestjs/testing';
import { CombineService } from './combine.service';

describe('CombineService', () => {
  let service: CombineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CombineService],
    }).compile();

    service = module.get<CombineService>(CombineService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
