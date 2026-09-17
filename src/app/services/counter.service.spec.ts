import { TestBed } from '@angular/core/testing';
import { CounterService } from './counter.service';
import { beforeEach, describe, expect, it } from 'vitest';

describe('CounterService', () => {
  let service: CounterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CounterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
