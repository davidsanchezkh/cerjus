import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map,Observable } from 'rxjs';
import { API_URL } from '../../../app.token'; // su token ya existente
import {firstValueFrom} from 'rxjs';
import { Router } from '@angular/router';

import { DTOLoginCreate } from '../models/login.dtos';
import { VMLoginCreate } from '../models/login.vm';
import { MapLoginCreate } from '../mappers/login.mapper';
import {toHttpParams} from '@app/components/utils/http.utils';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private http = inject(HttpClient);
  private router = inject(Router); 
  private apiUrl = inject(API_URL); // p.ej. http://localhost:3000
  private readonly base = `${this.apiUrl}/usuario`;


  async create(vm: VMLoginCreate): Promise<void> {
    const dto: DTOLoginCreate = MapLoginCreate(vm);

    await firstValueFrom(this.http.post(this.base, dto));

    this.router.navigate(['/login']);
  }

}
