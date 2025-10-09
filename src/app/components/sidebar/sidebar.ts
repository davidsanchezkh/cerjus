import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrls: ['./sidebar.css']
})
export class Sidebar {
  /** 1 = admin, 2 = supervisor, 3 = asesor; null/otros = sin sesión */
  @Input() userLevel: number | null = null;
  @Input() loggedIn = false;

  /** Regla correcta: menor número = más permisos */
  canSee(requiredLevel: number): boolean {
    return this.loggedIn && this.userLevel != null && this.userLevel <= requiredLevel;
  }
}