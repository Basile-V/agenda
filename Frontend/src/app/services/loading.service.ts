import { computed, Service, signal } from '@angular/core';

@Service()
export class LoadingService {
  private readonly slowRequestCount = signal(0);

  public readonly isWaitingForServer = computed(() => this.slowRequestCount() > 0);

  public startSlowRequest(): void {
    this.slowRequestCount.update((count) => count + 1);
  }

  public endSlowRequest(): void {
    this.slowRequestCount.update((count) => Math.max(0, count - 1));
  }
}
