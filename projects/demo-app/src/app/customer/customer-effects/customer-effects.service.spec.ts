import { TestBed } from '@angular/core/testing';

import { CustomerEffectsService } from './customer-effects.service';

describe('CustomerEffectsService', () => {
    beforeEach(() => TestBed.configureTestingModule({}));

    it('should be created', () => {
        const service: CustomerEffectsService = TestBed.get(CustomerEffectsService);
        expect(service).toBeTruthy();
    });
});
