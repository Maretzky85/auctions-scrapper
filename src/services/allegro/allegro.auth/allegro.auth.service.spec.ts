import { Test, TestingModule } from '@nestjs/testing';
import { AllegroAuthService } from './allegro.auth.service';

describe('Allegro.AuthService', () => {
  let service: AllegroAuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AllegroAuthService],
    }).compile();

    service = module.get<AllegroAuthService>(AllegroAuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
