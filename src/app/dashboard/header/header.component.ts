import { Component, inject, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CurrentUserService } from '../../services/current-user.service';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmationDialogComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  currentUserService = inject(CurrentUserService);
  private router = inject(Router);

  isLogoutDialogVisible = signal(false);
  mobileMenuToggle = output<void>();

  // بيانات افتراضية للإشعارات
  notificationCount = signal(3);

  toggleMobileMenu() {
    this.mobileMenuToggle.emit();
  }

  showLogoutConfirm() {
    this.isLogoutDialogVisible.set(true);
  }

  onLogoutResult(confirmed: boolean) {
    this.isLogoutDialogVisible.set(false);
    if (confirmed) {
      window.localStorage.removeItem('current-user');
      this.router.navigate(['/login']);
    }
  }
}
