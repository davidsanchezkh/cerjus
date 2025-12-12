import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { RouterLink } from '@angular/router';
import { AuthService } from '@/app/auth/auth.service';

@Component({
  selector: 'app-cuenta-ingresar',
  standalone: true,
  imports: [CommonModule, FormsModule,RouterLink],
  templateUrl: './ingresar.html',
  styleUrl: './ingresar.css'
})
export class Ingresar implements AfterViewInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;       
  error = ''; 

  inputsReady = false;
  private firstPaintAt = 0;
  private readonly minSkeletonMs = 180;

  logoLoaded = false;
  logoMissing = false;

  @ViewChild('emailInput', { read: ElementRef }) emailEl!: ElementRef<HTMLInputElement>;
  @ViewChild('passwordInput', { read: ElementRef }) passEl!: ElementRef<HTMLInputElement>;

  ngAfterViewInit(): void {
    this.firstPaintAt = performance.now();
    this.inputsReady = false;

    const tryReveal = (force = false) => {
      if (this.inputsReady) return;
      const elapsed = performance.now() - this.firstPaintAt;
      const minReached = elapsed >= this.minSkeletonMs;
      const eHas = !!this.emailEl?.nativeElement.value;
      const pHas = !!this.passEl?.nativeElement.value;
      if (minReached && (force || eHas || pHas)) this.inputsReady = true;
    };

    setTimeout(() => tryReveal(true), this.minSkeletonMs);
    setTimeout(() => tryReveal(true), 50);
    setTimeout(() => tryReveal(true), 250);

    this.emailEl.nativeElement.addEventListener('input', () => tryReveal(true), { passive: true });
    this.passEl.nativeElement.addEventListener('input', () => tryReveal(true), { passive: true });
  }

  onLogoLoad() { this.logoLoaded = true; this.logoMissing = false; }
  onLogoError() { this.logoLoaded = false; this.logoMissing = true; }

  onLogin() {
    if (!this.email || !this.password) {
      this.error = 'Debe ingresar email y contraseña.';
      return;
    }
    this.loading = true;
    this.error = '';

    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/ciudadano');
      },
      error: (err) => {
        this.loading = false;

        if (err?.status === 401 || err?.status === 400) {
          this.error = err?.error?.message || 'Credenciales inválidas.';
          return;
        }
      }
    });
  }
}