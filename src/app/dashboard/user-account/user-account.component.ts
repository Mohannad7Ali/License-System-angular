import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CurrentUserService } from '../../services/current-user.service';
import { PersonService } from '../../services/person.service';
import { User } from '../../models/user.model';
import { Person } from '../../models/person.model';

@Component({
  selector: 'app-user-account',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './user-account.component.html',
  styleUrl: './user-account.component.css',
})
export class UserAccountComponent implements OnInit {
  private currentUserService = inject(CurrentUserService);
  private personService = inject(PersonService);

  user = signal<User | null>(null);
  person = signal<Person | null>(null);
  isLoading = signal(true);

  ngOnInit(): void {
    const currentUser = this.currentUserService.getCurrentUser();
    if (currentUser) {
      this.user.set(currentUser);
      this.personService.read(currentUser.personID).subscribe({
        next: (data) => {
          this.person.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
    }
  }
}
