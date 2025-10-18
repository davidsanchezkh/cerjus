import { Component, computed, inject, effect } from '@angular/core';
import { NotificacionesService } from '../services/notificaciones.service';

@Component({
  selector: 'app-notificaciones-ver',
  standalone: true,
  templateUrl: './notificaciones.ver.html',
  styleUrls: ['./notificaciones.ver.css'],
})
export class NotificacionestVer {
  private svc = inject(NotificacionesService);

  // señales al template
  loading = this.svc.loading;
  ok = this.svc.okDialog;
  confirm = this.svc.confirmDialog;

  // helper: ¿hay algún modal abierto?
  get modalOpen(): boolean {
    return !!(this.ok() || this.confirm());
  }

  // clases de color para header (ok/confirm comparten estilos)
  headerClass = computed(() => {
    const variant = (this.ok() ?? this.confirm() ?? { variant: 'info' }).variant ?? 'info';
    return {
      success: variant === 'success',
      info: variant === 'info',
      warning: variant === 'warning',
      error: variant === 'error',
    };
  });

  constructor() {
    // cuando se abre un modal: blur del elemento activo + bloquear scroll del body
    effect(() => {
      if (this.modalOpen) {
        try { (document.activeElement as HTMLElement | null)?.blur?.(); } catch {}
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    });
  }

  // acciones
  onOkClick() { this.svc.resolveOk(); }
  onConfirmAccept() { this.svc.resolveConfirmAccept(); }
  onConfirmCancel() { this.svc.resolveConfirmCancel(); }

  // ===== Secuestro de teclado (único manejador) =====
  // Se llama desde backdrop y desde el propio dialog (keydown.capture)
  handleKey(ev: Event, kind: 'ok' | 'confirm') {
    const e = ev as KeyboardEvent;
    // si por alguna razón no es KeyboardEvent, salimos
    if (!('key' in e)) return;

    // 1) Nunca dejar que Tab navegue por el DOM de fondo
    if (e.key === 'Tab') {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // 2) Escape cierra: en OK → aceptar; en Confirm → cancelar
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      if (kind === 'ok') this.onOkClick();
      else this.onConfirmCancel();
      return;
    }

    // 3) Para cualquier otra tecla (incluye letras, números, flechas, etc.)
    // la consumimos para que no “caiga” al fondo
    if (this.modalOpen) {
      e.preventDefault();
      e.stopPropagation();
    }
  }
}


