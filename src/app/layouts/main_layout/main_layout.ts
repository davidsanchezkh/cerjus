import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Header } from '@/app/components/header/header';
import { RouterOutlet } from '@angular/router';
import { NotificacionestVer } from '@/app/components/notificaciones/notificaciones.ver/notificaciones.ver';
import { AuthStore } from '@/app/auth/auth.store';;

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

  loggedIn = false;
  userLevel: number | null = null;

  ngOnInit(): void {
    this.sub = this.auth.isLoggedInChanges().subscribe(v => this.loggedIn = v);
    this.sub.add(this.auth.levelChanges().subscribe(l => this.userLevel = l));
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}