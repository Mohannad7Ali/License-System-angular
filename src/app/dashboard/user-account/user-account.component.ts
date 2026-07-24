import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

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
  private destroyRef = inject(DestroyRef);

  user = signal<User | null>(null);
  person = signal<Person | null>(null);
  isLoading = signal(true);

  // 🛠️ حماية وقيم مجمعة آمنة لكافة خصائص المستخدم والحساب
  usernameDisplay = computed(() => {
    const u = this.user() as any;
    return u?.username ?? u?.userName ?? 'غير محدد';
  });

  userIdDisplay = computed(() => {
    const u = this.user() as any;
    return u?.id ?? u?.userID ?? u?.userId ?? '---';
  });

  isUserActive = computed(() => {
    const u = this.user() as any;
    return Boolean(u?.isActive ?? u?.isUserActive ?? false);
  });

  // 🛠️ حماية وقيم مجمعة آمنة لكافة الخصائص الشخصية
  fullNameDisplay = computed(() => {
    const p = this.person() as any;
    if (!p) return 'غير متوفر';

    if (p.fullName) return p.fullName;

    const names = [p.firstName, p.secondName, p.thirdName, p.lastName]
      .filter((n) => Boolean(n))
      .join(' ');

    return names.trim() || 'غير متوفر';
  });

  nationalNoDisplay = computed(() => {
    const p = this.person() as any;
    return p?.nationalNumber ?? p?.nationalNo ?? 'غير متوفر';
  });

  genderDisplay = computed(() => {
    const p = this.person() as any;
    const g = p?.gender ?? p?.gander;
    if (g === 'Male' || g === 0 || g === '0' || g === 'ذكر') return 'ذكر';
    if (g === 'Female' || g === 1 || g === '1' || g === 'أنثى') return 'أنثى';
    return 'غير محدد';
  });

  emailDisplay = computed(() => {
    const p = this.person() as any;
    return p?.email || 'غير متوفر';
  });

  phoneDisplay = computed(() => {
    const p = this.person() as any;
    return p?.phoneNumber ?? p?.phone ?? 'غير متوفر';
  });

  ngOnInit(): void {
    const currentUser = this.currentUserService.getCurrentUser() as any;

    if (currentUser) {
      this.user.set(currentUser);

      const personId = Number(
        currentUser.personID ?? currentUser.personId ?? currentUser.PersonID,
      );

      if (!isNaN(personId) && personId > 0) {
        this.personService
          .read(personId)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            next: (data) => {
              this.person.set(data);
              this.isLoading.set(false);
            },
            error: () => this.isLoading.set(false),
          });
      } else {
        this.isLoading.set(false);
      }
    } else {
      this.isLoading.set(false);
    }
  }
}
