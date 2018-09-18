import { Delay } from './delay';
import { cold, getTestScheduler, hot } from 'jasmine-marbles';

describe('Delay', () => {
  let delay: Delay;
  beforeEach(() => {
    delay = new Delay();
  });

  it('should delay Observable', () => {
    const source = cold('-a--a--a|', { a: 'hello' });
    const result = cold('--x--x--x|', { x: 'hello' });

    expect(delay.delayByTenObservable(source, getTestScheduler())).toBeObservable(result);
  });

  it('test something', () => {
    const a = hot('  a-^--a--b--|', { a: 'Hello', b: 'World' });
    const b = hot('  --^--a--b--|', { a: 'Hello', b: 'World' });

    expect(a).toBeObservable(b);
  });

  it('should delay by x number of seconds and multiply by 2', () => {
    const value = 4;
    const resultValue = 8;

    const inputObs = cold('--x---x-|', { x: value });
    const outObs = cold('  ---y---y-|', { y: resultValue });

    expect(delay.delayByTenAndMultiplyByTwo(inputObs, getTestScheduler())).toBeObservable(outObs);
  });
});
