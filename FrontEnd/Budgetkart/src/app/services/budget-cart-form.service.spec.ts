import { TestBed } from '@angular/core/testing';

import { BudgetCartFormService } from './budget-cart-form.service';

describe('BudgetCartFormService', () => {
  let service: BudgetCartFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BudgetCartFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
