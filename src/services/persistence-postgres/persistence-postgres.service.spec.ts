import { Test, TestingModule } from '@nestjs/testing';
import { PersistencePostgresService } from './persistence-postgres.service';

describe('PersistencePostgresService', () => {
  let service: PersistencePostgresService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PersistencePostgresService],
    }).compile();

    service = module.get<PersistencePostgresService>(PersistencePostgresService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
