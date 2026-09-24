import { TestBed } from '@angular/core/testing';
import { LoadingService } from './loading.service';

describe('LoadingService', () => {
  let service: LoadingService;

  beforeEach(() => {
    service = TestBed.inject(LoadingService);
  });

  it('is not waiting for the server by default', () => {
    expect(service.isWaitingForServer()).toBeFalse();
  });

  it('waits until every slow request has ended', () => {
    service.startSlowRequest();
    service.startSlowRequest();
    service.endSlowRequest();
    expect(service.isWaitingForServer()).toBeTrue();

    service.endSlowRequest();
    expect(service.isWaitingForServer()).toBeFalse();
  });

  it('never goes below zero pending slow requests', () => {
    service.endSlowRequest();
    service.startSlowRequest();
    expect(service.isWaitingForServer()).toBeTrue();
  });
});
