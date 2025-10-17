
import { Injectable, signal } from '@angular/core';
import { OkDialogOptions, LoadingState,ConfirmDialogOptions } from '../models/notificaciones.vm';

@Injectable({ providedIn: 'root' })
export class NotificacionesService {
  // === LOADING (con timers internos) ===
  private pendingCount = 0;
  private showTimer: any = null;
  private longTimer: any = null;
  private deadmanTimer: any = null;

  readonly loading = signal<LoadingState>({ visible: false, message: 'Procesando…' });

  // ajustes (puedes moverlos a InjectionToken si quieres configurarlo global)
  private debounceMs = 1000;      // evita parpadeo
  private longMs = 2000;         // mensaje “despertando servidor…”
  private deadmanMs = 30000;     // corta spinners eternos

  startLoading() {
    this.pendingCount++;
    if (this.pendingCount === 1) {
      // primer request activa timers
      this.clearTimers();

      this.showTimer = setTimeout(() => {
        this.loading.set({ visible: true, message: 'Procesando…' });
      }, this.debounceMs);

      this.longTimer = setTimeout(() => {
        if (this.loading().visible) {
          this.loading.set({ visible: true, message: 'Despertando el servidor… esto puede tardar unos segundos.' });
        }
      }, this.longMs);

      this.deadmanTimer = setTimeout(() => {
        // si llega acá, deja de mostrar loading; el error lo maneja el interceptor
        this.hideLoading();
      }, this.deadmanMs);
    }
  }

  stopLoading() {
    this.pendingCount = Math.max(0, this.pendingCount - 1);
    if (this.pendingCount === 0) {
      this.hideLoading();
    }
  }

  private hideLoading() {
    this.clearTimers();
    this.loading.set({ visible: false, message: 'Procesando…' });
  }

  private clearTimers() {
    if (this.showTimer) { clearTimeout(this.showTimer); this.showTimer = null; }
    if (this.longTimer) { clearTimeout(this.longTimer); this.longTimer = null; }
    if (this.deadmanTimer) { clearTimeout(this.deadmanTimer); this.deadmanTimer = null; }
  }

  // === DIÁLOGO OK (bloqueante) ===
  readonly okDialog = signal<OkDialogOptions | null>(null);
  private okResolver: (() => void) | null = null;

  /** Muestra un diálogo OK y espera el clic del usuario. */
  ok(opts: OkDialogOptions): Promise<void> {
    this.okDialog.set({
      variant: 'info',
      primaryText: 'OK',
      ...opts,
    });
    return new Promise<void>((resolve) => {
      this.okResolver = resolve;
    });
  }

  /** Llama esto desde el botón "OK" del diálogo. */
  resolveOk() {
    if (this.okResolver) this.okResolver();
    this.okResolver = null;
    this.okDialog.set(null);
  }

  // === CONFIRM ===
  readonly confirmDialog = signal<ConfirmDialogOptions | null>(null);
  private confirmResolver: ((v: boolean) => void) | null = null;

  /** Muestra un diálogo Confirmar/Cancelar y espera la decisión del usuario. */
  confirm(opts: ConfirmDialogOptions): Promise<boolean> {
    this.confirmDialog.set({
      variant: 'warning',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      ...opts,
    });
    return new Promise<boolean>((resolve) => {
      this.confirmResolver = resolve;
    });
  }
   /** Llamar cuando el usuario confirma. */
  resolveConfirmAccept() {
    if (this.confirmResolver) this.confirmResolver(true);
    this.confirmResolver = null;
    this.confirmDialog.set(null);
  }

  /** Llamar cuando el usuario cancela. */
  resolveConfirmCancel() {
    if (this.confirmResolver) this.confirmResolver(false);
    this.confirmResolver = null;
    this.confirmDialog.set(null);
  }
}