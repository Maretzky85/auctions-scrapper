import { Test, TestingModule } from '@nestjs/testing';
import { OlxService } from './olx.service';

describe('OlxService', () => {
  let service: OlxService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OlxService],
    }).compile();

    service = module.get<OlxService>(OlxService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
