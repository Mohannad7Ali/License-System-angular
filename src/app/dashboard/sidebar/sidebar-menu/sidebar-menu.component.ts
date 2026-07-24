import { Component, inject, signal, WritableSignal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';

type MenuKeys = 'admin' | 'services' | 'operations' | 'archives' | 'system';

@Component({
  selector: 'app-sidebar-menu',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ConfirmationDialogComponent],
  templateUrl: './sidebar-menu.component.html',
  styleUrl: './sidebar-menu.component.css',
})
export class SidebarMenuComponent {
  private router = inject(Router);
  isDialogVisible = signal<boolean>(false);

  // إغلاق كل القوائم وفتح واحدة فقط لتوفير مساحة وتجربة سلسة
  menuOpen: Record<MenuKeys, WritableSignal<boolean>> = {
    admin: signal(false),
    services: signal(false),
    operations: signal(false),
    archives: signal(false),
    system: signal(false),
  };

  ontoggle(menu: MenuKeys) {
    Object.keys(this.menuOpen).forEach((key) => {
      if (key !== menu) {
        this.menuOpen[key as MenuKeys].set(false);
      }
    });
    this.menuOpen[menu].set(!this.menuOpen[menu]());
  }

  logout() {
    this.isDialogVisible.set(true);
  }

  onDialogResult(isConfirmed: boolean) {
    this.isDialogVisible.set(false);
    if (isConfirmed) {
      window.localStorage.removeItem('current-user');
      this.router.navigate(['/login']);
    }
  }
}
