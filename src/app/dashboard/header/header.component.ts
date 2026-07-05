import { Component, inject, signal, output } from '@angular/core';
import { CurrentUserService } from '../../services/current-user.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  currentUserService = inject(CurrentUserService);
  private router = inject(Router);
  menuOpen = signal<boolean>(false);
  mobileMenuToggle = output<void>();

  constructor() {}

  toggleMenu() {
    this.menuOpen.set(!this.menuOpen());
  }

  toggleMobileMenu() {
    this.mobileMenuToggle.emit();
  }

  logout() {
    if (window.confirm('Are you sure you want to logout?')) {
      window.localStorage.setItem('current-user', JSON.stringify(undefined));
      this.router.navigate(['/login']);
    }
  }
}
