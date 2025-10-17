import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NotificacionestVer } from '@/app/components/notificaciones/notificaciones.ver/notificaciones.ver';
@Component({
  selector: 'app-simple_layout',
  imports: [RouterOutlet,NotificacionestVer],
  templateUrl: './simple_layout.html',
  
})
export class Simple_layout {

}