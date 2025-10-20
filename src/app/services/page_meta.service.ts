import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PageMeta {
  titulo?: string;   
  ruta?: string | any[];   
}

@Injectable({ providedIn: 'root' })
export class PageMetaService {
  private readonly _meta$ = new BehaviorSubject<PageMeta>({});
  readonly meta$ = this._meta$.asObservable();

  set(meta: Partial<PageMeta>) {
    this._meta$.next({ ...this._meta$.value, ...meta });
  }
  replace(meta: PageMeta) {
    this._meta$.next(meta);
  }
  clear() { this._meta$.next({}); }
}