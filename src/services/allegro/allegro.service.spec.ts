import { Test, TestingModule } from '@nestjs/testing';
import { AllegroService } from './allegro.service';
import { AllegroAuthService } from './allegro.auth/allegro.auth.service';
import { HttpModule } from '@nestjs/common';



describe('AllegroService', () => {
  let service: AllegroService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [AllegroService, AllegroAuthService],
    }).compile();

    service = module.get<AllegroService>(AllegroService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
