import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Header } from '@/app/components/header/header';
import { RouterOutlet } from '@angular/router';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter, map } from 'rxjs/operators';
import { NotificacionestVer } from '@/app/components/notificaciones/notificaciones.ver/notificaciones.ver';
import { AuthStore } from '@/app/auth/auth.store';;
import { PageMetaService, PageMeta } from '@/app/services/page_meta.service';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, Sidebar, Header, RouterOutlet,NotificacionestVer],
  templateUrl: './main_layout.html',
  styleUrl:'./main_layout.css'
})
export class Main_layout implements OnInit, OnDestroy {
  private auth = inject(AuthStore);
  private sub?: Subscription;
  private subRouteMeta?: Subscription;

  private router = inject(Router);
  private route  = inject(ActivatedRoute);
  private meta   = inject(PageMetaService);

  loggedIn = false;
  userLevel: number | null = null;

  constructor() {
    this.subRouteMeta = this.router.events
      .pipe(
        filter(e => e instanceof NavigationEnd),
        map(() => {
          let r: ActivatedRoute = this.route;
          while (r.firstChild) r = r.firstChild;
          return (r.snapshot.data?.['meta'] as PageMeta)
              ?? (r.snapshot.data as PageMeta)
              ?? {};
        })
      )
      .subscribe(m => this.meta.replace(m));
  }

  ngOnInit(): void {
    this.sub = this.auth.isLoggedInChanges().subscribe(v => this.loggedIn = v);
    this.sub.add(this.auth.levelChanges().subscribe(l => this.userLevel = l));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.subRouteMeta?.unsubscribe();
  }

}