import { Observable } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { asyncScheduler } from 'rxjs';

export class Delay {
  public delayByTenObservable(source: Observable<any>, scheduler = asyncScheduler) {
    return source.pipe(delay(10, scheduler));
  }

  public delayByTenAndMultiplyByTwo(source: Observable<any>, scheduler = asyncScheduler) {
    return source.pipe(
      delay(10, scheduler),
      map(x => x * 2),
    );
  }
}
