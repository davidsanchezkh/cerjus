// src/app/pages/cuenta/services/cuenta.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, firstValueFrom } from 'rxjs';
import { API_URL } from '../../../app.token';
import { Router } from '@angular/router';

import { DTOCuentaCreate, DTOCuentaPerfil, DTOCuentaPerfilUpdate, DTOCuentaChangePassword } from '../models/cuenta.dtos';
import { VMCuentaCreate, VMCuentaPerfil, VMCuentaPerfilUpdateForm } from '../models/cuenta.vm';
import { MapCuentaCreate, MapCuentaPerfilFromDTO, MapCuentaPerfilUpdate } from '../mappers/cuenta.mapper';

@Injectable({ providedIn: 'root' })
export class CuentaService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = inject(API_URL);
  private readonly base = `${this.apiUrl}/usuario`;

  // === Crear cuenta (ya lo tenías) ===
  async create(vm: VMCuentaCreate): Promise<number> {
    const dto: DTOCuentaCreate = MapCuentaCreate(vm);
    const res = await firstValueFrom(
      this.http.post<{ us_ID: number }>(this.base, dto)
    );
    return res.us_ID;
  }

  // === Obtener MI perfil (usa GET /usuario/mi-perfil) ===
  getMiPerfil(): Observable<VMCuentaPerfil> {
    return this.http
      .get<DTOCuentaPerfil>(`${this.base}/mi-perfil`)
      .pipe(map(MapCuentaPerfilFromDTO));
  }

  // === Actualizar MI perfil (usa PATCH /usuario/miactualizacion) ===
  async updateMiPerfil(vm: VMCuentaPerfilUpdateForm): Promise<void> {
    const dto: DTOCuentaPerfilUpdate = MapCuentaPerfilUpdate(vm);
    await firstValueFrom(
      this.http.patch<void>(`${this.base}/miactualizacion`, dto)
    );
  }

  // === Cambiar MI contraseña (usa PATCH /usuario/mi-contrasena) ===
  async changePassword(actual: string, nueva: string): Promise<void> {
    const dto: DTOCuentaChangePassword = {
      us_contrasena: actual,
      us_new_contrasena: nueva,
    };
    await firstValueFrom(
      this.http.patch<void>(`${this.base}/mi-contrasena`, dto)
    );
  }
}
