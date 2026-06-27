import { Component, inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@/app/auth/auth.service';
import { PageMetaService, PageMeta } from '@/app/services/page_meta.service';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css'
})
export class Header implements OnDestroy {
  private auth = inject(AuthService);
  private router = inject(Router);
  private metaSvc = inject(PageMetaService);

  title = '';
  backLink: string | any[] | null = null;

  private subMeta?: Subscription;

  constructor() {
    this.subMeta = this.metaSvc.meta$.subscribe((m) => {
      this.applyMeta(m);
    });
  }

  ngOnDestroy() {
    this.subMeta?.unsubscribe();
  }

  onLogout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  goBack() {
    if (Array.isArray(this.backLink)) {
      this.router.navigate(this.backLink);
    } else if (typeof this.backLink === 'string') {
      this.router.navigateByUrl(this.backLink);
    } else {
      window.history.back();
    }
  }

  private applyMeta(m: PageMeta | undefined | null): void {
    this.title = m?.titulo?.trim() ?? '';
    this.backLink = m?.ruta ?? null;
  }
}
