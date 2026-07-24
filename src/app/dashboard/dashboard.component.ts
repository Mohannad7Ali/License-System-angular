import { Component, signal, ViewChild, ElementRef } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NotificationComponent } from '../shared/notification/notification.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    HeaderComponent,
    SidebarComponent,
    RouterOutlet,
    NotificationComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
})
export class DashboardComponent {
  mobileMenuOpen = signal<boolean>(false);
  @ViewChild('sidebarElement') sidebarElement!: ElementRef<HTMLElement>;
  @ViewChild('overlayElement') overlayElement!: ElementRef<HTMLElement>;

  toggleMobileMenu() {
    this.mobileMenuOpen.set(!this.mobileMenuOpen());
    if (this.sidebarElement && this.overlayElement) {
      if (this.mobileMenuOpen()) {
        this.sidebarElement.nativeElement.classList.add('mobile-open');
        this.overlayElement.nativeElement.classList.add('active');
      } else {
        this.sidebarElement.nativeElement.classList.remove('mobile-open');
        this.overlayElement.nativeElement.classList.remove('active');
      }
    }
  }

  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
    if (this.sidebarElement && this.overlayElement) {
      this.sidebarElement.nativeElement.classList.remove('mobile-open');
      this.overlayElement.nativeElement.classList.remove('active');
    }
  }
}
