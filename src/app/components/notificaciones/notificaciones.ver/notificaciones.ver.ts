import { Component, computed, inject } from '@angular/core';
import { NotificacionesService } from '../services/notificaciones.service';

@Component({
  selector: 'app-notificaciones-ver',
  standalone: true,
  templateUrl: './notificaciones.ver.html',
  styleUrls: ['./notificaciones.ver.css'],
})
export class NotificacionestVer {
  private svc = inject(NotificacionesService);

  // señales expuestas al template
  loading = this.svc.loading;
  ok = this.svc.okDialog;
  confirm = this.svc.confirmDialog;

  // clases de color para el header del diálogo OK
   headerClass = computed(() => {
    const variant = (this.ok() ?? this.confirm() ?? { variant: 'info' }).variant ?? 'info';
    return {
      success: variant === 'success',
      info: variant === 'info',
      warning: variant === 'warning',
      error: variant === 'error',
    };
  });

  // acción del botón OK
  onOkClick() {
    this.svc.resolveOk();
  }
  onConfirmAccept() { 
    this.svc.resolveConfirmAccept(); 
  }
  onConfirmCancel() { 
    this.svc.resolveConfirmCancel();
  }
}
