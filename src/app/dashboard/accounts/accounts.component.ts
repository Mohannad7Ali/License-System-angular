import { Component, OnDestroy, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription, tap, catchError, throwError } from 'rxjs';

import { UserService } from '../../services/user.service';
import { NotificationService } from '../../services/notification.service';
import { User } from '../../models/user.model';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { NotificationComponent } from '../../shared/notification/notification.component';

@Component({
  selector: 'app-accounts',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmationDialogComponent,
    NotificationComponent,
  ],
  templateUrl: './accounts.component.html',
  styleUrl: './accounts.component.css',
})
export class AccountsComponent implements OnInit, OnDestroy {
  // حقن الخدمات
  private userService = inject(UserService);
  private notifyServ = inject(NotificationService);
  private router = inject(Router);

  // المتغيرات
  subcriptions: Subscription[] = [];
  user_id: number | null = null;
  currentPage = 1;
  pageSize = 6;
  users: User[] = [];
  filteredUsers: User[] = [];
  displayedData: User[] = [];
  filter = new FormControl('', { nonNullable: true });
  isDialogVisible = signal<boolean>(false);

  ngOnInit(): void {
    this.loadData();

    // البحث التلقائي عند الكتابة
    const filterSub = this.filter.valueChanges
      .pipe(tap((value) => this.applyFilter(value)))
      .subscribe();

    this.subcriptions.push(filterSub);
  }

  loadData(): void {
    const subscription = this.userService.all().subscribe({
      next: (data) => {
        this.users = data;
        this.filteredUsers = data;
        this.updateDisplayedData();
      },
      error: () => {
        this.notifyServ.showMessage({
          message: 'حدث خطأ أثناء تحميل بيانات المستخدمين.',
          status: 'failed',
        });
      },
    });
    this.subcriptions.push(subscription);
  }

  // التنقل لصفحة الإضافة
  onAddUser() {
    this.router.navigate(['/dashboard/accounts/add']);
  }

  // التنقل لصفحة التعديل
  onEditUser(id: number) {
    this.router.navigate(['/dashboard/accounts/edit', id]);
  }

  applyFilter(value: string) {
    const lowerCaseFilter = value.toLowerCase().trim();
    this.filteredUsers = this.users.filter(
      (item) =>
        item.username.toLowerCase().includes(lowerCaseFilter) ||
        item.fullName?.toLowerCase().includes(lowerCaseFilter) ||
        item.id.toString().includes(lowerCaseFilter),
    );
    this.currentPage = 1;
    this.updateDisplayedData();
  }

  updateDisplayedData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.filteredUsers.slice(startIndex, endIndex);
  }

  onNext() {
    if (this.currentPage * this.pageSize < this.filteredUsers.length) {
      this.currentPage++;
      this.updateDisplayedData();
    }
  }

  onPrevious() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedData();
    }
  }

  onDelete(id: number) {
    this.user_id = id;
    this.isDialogVisible.set(true);
  }

  onDialogResult(isConfirmed: boolean) {
    this.isDialogVisible.set(false);
    if (isConfirmed && this.user_id !== null) {
      const subscription = this.userService.delete(this.user_id).subscribe({
        next: () => {
          this.notifyServ.showMessage({
            message: 'تم حذف المستخدم بنجاح.',
            status: 'success',
          });
          this.loadData();
        },
        error: () => {
          this.notifyServ.showMessage({
            message: 'لا يمكن حذف المستخدم لارتباطه بسجلات أخرى في النظام.',
            status: 'failed',
          });
        },
      });
      this.subcriptions.push(subscription);
    }
  }

  ngOnDestroy(): void {
    this.subcriptions.forEach((sub) => sub.unsubscribe());
  }
}
