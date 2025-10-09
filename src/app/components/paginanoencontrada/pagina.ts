import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { PaginaNoEncontradaService } from './services/paginanoencontrada.service';

@Component({
  selector: 'app-pagina-no-encontrada',
  standalone: true,
  templateUrl: './pagina.html',
  styleUrls: ['./pagina.css']
})
export class PaginaNoEncontradaComponent {
  constructor(
    private router: Router,
    private location: Location,
    private nav: PaginaNoEncontradaService
  ) {}

  async volver() {
    const hasToken = !!localStorage.getItem('token');

    // 0) Sin sesión → login
    if (!hasToken) {
      await this.router.navigate(['/login']);
      return;
    }

    // 1) La última URL válida conocida
    const lastGood = this.nav.getLastGoodUrl();
    if (lastGood) {
      const ok = await this.router.navigateByUrl(lastGood, { replaceUrl: true });
      if (ok) return;
    }

    // 2) Fallback inteligente desde la última “mala”
    const lastBad = this.nav.getLastBadUrl();
    const guess = this.nav.fallbackFrom(lastBad);
    if (guess) {
      const ok = await this.router.navigateByUrl(guess, { replaceUrl: true });
      if (ok) return;
    }

    // 3) Intentar historial si el referrer es mismo origen
    try {
      const sameOrigin =
        document.referrer &&
        new URL(document.referrer).origin === window.location.origin;
      if (sameOrigin && window.history.length > 1) {
        this.location.back();
        return;
      }
    } catch {
      // ignore
    }

    // 4) Fallback absoluto seguro
    await this.router.navigate(['/ciudadano'], { replaceUrl: true });
  }
}