import { cold, getTestScheduler } from 'jasmine-marbles';
import { LongPollingService, RetryStrategyConfiguration } from './pooling.service';
import { iif } from 'rxjs';

describe('Polling Service', () => {
  const retryConfiguration: RetryStrategyConfiguration = {
    retryAttempts: 5,
    maxDelay: 300,
    createDelay: attempt => attempt * 10,
  };
  let lps: LongPollingService;
  beforeEach(() => {
    lps = new LongPollingService();
    lps.setup(retryConfiguration);
  });

  it('should do magic', () => {
    // setup marble diagrams
    const httpRequest = cold('-x|', { x: 'Marbles are awesome' });
    const result = cold('-a----a----a----a----a----a----a----a----a----a----a----a----a----a----a', {
      a: 'Marbles are awesome',
    });

    //setup methods
    const pooling = lps.longPollData(httpRequest, 30, 2, getTestScheduler());

    // assert
    expect(pooling).toBeObservable(result);
  });

  it('should do magic on error', () => {
    // setup marble diagrams
    const requestFail = cold('-#');
    const result = cold('------#', {}, new Error('Attempt limit reached'));

    //setup methods
    const pooling = lps.longPollData(requestFail, 30, 2, getTestScheduler());

    // assert
    expect(pooling).toBeObservable(result);
  });

  it('should do magic on error and recover', () => {
    let attempt = 1;
    // setup marble diagrams
    const requestFail = cold('   -#');
    const requestSuccess = cold('-(a|)', { a: 'Marbles are awesome' });
    const result = cold(
      '------a--a--a--a--a--a--a--a--a--a--a--a--a--a--a--a--a--a--a--a--a--a--a--a',
      { a: 'Marbles are awesome' },
      new Error('Attempt limit reached'),
    );
    const requestFailSuccess = iif(
      () => {
        if (attempt === 3) {
          return false;
        } else {
          attempt = attempt + 1;
          return true;
        }
      },
      requestFail,
      requestSuccess,
    );

    //setup methods
    const pooling = lps.longPollData(requestFailSuccess, 20, 3, getTestScheduler());

    // assert
    expect(pooling).toBeObservable(result);
  });
});
