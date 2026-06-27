import { Component, Input, OnDestroy, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar implements OnInit, OnDestroy, OnChanges {
  /** 1 = admin, 2 = supervisor, 3 = asesor; null/otros = sin sesión */
  @Input() userLevel: number | null = null;
  @Input() loggedIn = false;

  currentUrl = '';

  openGroups = {
    asesoria: false,
    supervision: false,
    admin: false,
  };

  private subRouter?: Subscription;
  private initializedByRoute = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.currentUrl = this.router.url;
    this.openCurrentRouteGroupOnce();

    this.subRouter = this.router.events
    .pipe(filter(e => e instanceof NavigationEnd))
    .subscribe((e) => {
      const nav = e as NavigationEnd;
      this.currentUrl = nav.urlAfterRedirects;

      if (!this.initializedByRoute) {
        this.openCurrentRouteGroupOnce();
      }
    });
  }

  ngOnChanges(_changes: SimpleChanges): void {
    /*
      Cuando loggedIn/userLevel llegan después del ngOnInit,
      se intenta una sola vez abrir el grupo correspondiente.
    */
    this.openCurrentRouteGroupOnce();
  }

  ngOnDestroy(): void {
    this.subRouter?.unsubscribe();
  }

  /** Regla correcta: menor número = más permisos */
  canSee(requiredLevel: number): boolean {
    return this.loggedIn && this.userLevel != null && this.userLevel <= requiredLevel;
  }

  toggleGroup(group: keyof typeof this.openGroups): void {
    this.openGroups[group] = !this.openGroups[group];
  }

  isAsesoriaActive(item: 'asistencia' | 'ciudadano' | 'consulta' | 'proceso'): boolean {
    const url = this.cleanUrl();

    switch (item) {
      case 'asistencia':
        return this.firstSegmentIs('asistencia', url);

      case 'ciudadano':
        return this.firstSegmentIs('ciudadano', url);

      case 'consulta':
        return this.firstSegmentIs('consulta', url);

      case 'proceso':
        return this.firstSegmentIs('proceso', url);
    }
  }

  isSupervisionActive(item: 'analiticas' | 'controlusuario' | 'justificacion'): boolean {
    const url = this.cleanUrl();

    switch (item) {
      case 'analiticas':
        return this.firstSegmentIs('analiticas', url);

      case 'controlusuario':
        return this.firstSegmentIs('controlusuario', url);

      case 'justificacion':
        return this.firstSegmentIs('justificacion', url);
    }
  }

  isAdminActive(item: 'usuarios' | 'horario'): boolean {
    const url = this.cleanUrl();

    switch (item) {
      case 'usuarios':
        return url === '/admin/usuario/lista' || url.startsWith('/admin/usuario/');

      case 'horario':
        return this.firstSegmentIs('horario', url);
    }
  }

  isPerfilActive(): boolean {
    const url = this.cleanUrl();
    return url === '/cuenta/perfil' || url.startsWith('/cuenta/perfil/');
  }

  private openCurrentRouteGroupOnce(): void {
    if (this.initializedByRoute) return;
    if (!this.loggedIn || this.userLevel == null) return;

    const url = this.cleanUrl();

    if (!url || url === '/') return;

    if (this.canSee(3) && this.belongsToAsesoria(url)) {
      this.openGroups.asesoria = true;
      this.initializedByRoute = true;
      return;
    }

    if (this.canSee(3) && this.belongsToSupervision(url)) {
      this.openGroups.supervision = true;
      this.initializedByRoute = true;
      return;
    }

    if (this.canSee(2) && this.belongsToAdmin(url)) {
      this.openGroups.admin = true;
      this.initializedByRoute = true;
      return;
    }

    if (this.isPerfilActive()) {
      this.initializedByRoute = true;
    }
  }

  private belongsToAsesoria(url: string): boolean {
    return (
      this.firstSegmentIs('asistencia', url) ||
      this.firstSegmentIs('ciudadano', url) ||
      this.firstSegmentIs('consulta', url) ||
      this.firstSegmentIs('proceso', url)
    );
  }

  private belongsToSupervision(url: string): boolean {
    return (
      this.firstSegmentIs('analiticas', url) ||
      this.firstSegmentIs('controlusuario', url) ||
      this.firstSegmentIs('justificacion', url)
    );
  }

  private belongsToAdmin(url: string): boolean {
    return (
      url === '/admin/usuario/lista' ||
      url.startsWith('/admin/usuario/') ||
      this.firstSegmentIs('horario', url)
    );
  }

  private firstSegmentIs(segment: string, url: string): boolean {
    return url === `/${segment}` || url.startsWith(`/${segment}/`);
  }

  private cleanUrl(): string {
    return (this.currentUrl || '').split('?')[0].split('#')[0];
  }
}