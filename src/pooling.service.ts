import { Observable, Subject, concat, throwError, timer, asyncScheduler, Scheduler } from 'rxjs';
import { switchMap, startWith, tap, retryWhen, mergeMap } from 'rxjs/operators';

const defaultRetryConfiguration: RetryStrategyConfiguration = {
  retryAttempts: 5,
  maxDelay: 30000,
  createDelay: (attempt: number): number => Math.pow(attempt, 2) * 1000,
};

export class LongPollingService {
  constructor() {
    this.setup(defaultRetryConfiguration);
  }
  private defaultRetryConfiguration: RetryStrategyConfiguration;

  public setup(defaultRetryConfiguration: RetryStrategyConfiguration) {
    this.defaultRetryConfiguration = defaultRetryConfiguration;
  }
  public longPollData = <T>(
    request$: Observable<T>,
    interval: number,
    retryAttempts = 0,
    scheduler = asyncScheduler,
  ): Observable<T> => {
    const trigger$: Subject<void> = new Subject<void>();
    return trigger$.pipe(
      startWith(undefined),
      switchMap(() =>
        concat(
          request$.pipe(retryWhen(this.retryStrategy({ retryAttempts }, scheduler))),
          timer(interval, scheduler).pipe(
            tap(() => {
              trigger$.next();
            }),
          ),
        ),
      ),
    ) as Observable<T>;
  };

  /**
   * strategy to retry on pull
   * @param options options object retryAttempts keeps information how any times retry before fail
   */
  private retryStrategy(
    {
      retryAttempts = this.defaultRetryConfiguration,
      maxDelay = this.defaultRetryConfiguration.maxDelay,
      createDelay = this.defaultRetryConfiguration.createDelay,
    }: any,
    scheduler: Scheduler,
  ): (source: Observable<any>) => Observable<number> {
    return (source: Observable<any>): Observable<number> =>
      source.pipe(
        mergeMap((_error, i) => {
          const attemptCount = i + 1;
          if (retryAttempts !== 0 && attemptCount > retryAttempts) {
            return throwError(new Error('Attempt limit reached'));
          }
          const delayTime = Math.min(maxDelay, createDelay(attemptCount));
          return timer(delayTime, scheduler);
        }),
      );
  }
}

interface RetryStrategyFunction {
  /**
   * function to that generated delay
   * @param attempt attempt of execution starts with 1
   * @return delay in seconds
   */
  createDelay(attempt: number): number;
}
export interface RetryStrategyConfiguration extends RetryStrategyFunction {
  /**
   * how many times retry to fech
   * if 0 is provided it never stops
   */
  retryAttempts: number;
  /**
   * maxDelay between attempts in seconds
   */
  maxDelay: number;
}
