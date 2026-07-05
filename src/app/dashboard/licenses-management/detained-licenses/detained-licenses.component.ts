import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core'; // تم التصحيح لـ @angular/core ✅
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router'; // تم التأكد من مكان الاستيراد
import { tap, debounceTime } from 'rxjs';

import { DetainedLicenseService } from '../../../services/detained-license.service';
import { LicenseService } from '../../../services/license.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { NotificationComponent } from '../../../shared/notification/notification.component';

@Component({
  selector: 'app-detained-licenses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    CurrencyPipe,
    ConfirmationDialogComponent,
    NotificationComponent,
    RouterLink,
  ],
  templateUrl: './detained-licenses.component.html',
  styleUrl: './detained-licenses.component.css',
})
export class DetainedLicensesComponent implements OnInit {
  // الخدمات
  private detainedService = inject(DetainedLicenseService);
  private licenseService = inject(LicenseService);
  private notify = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  // البيانات
  list: any[] = [];
  filteredList: any[] = [];
  displayedData: any[] = [];

  // التحكم
  currentPage = 1;
  pageSize = 6;
  filter = new FormControl('', { nonNullable: true });
  isDialogVisible = signal(false);
  licenseID: number | undefined = undefined;
  current_user_id: number | null = null;

  ngOnInit(): void {
    // جلب بيانات المستخدم من LocalStorage
    const userData = localStorage.getItem('current-user');
    if (userData) {
      this.current_user_id = JSON.parse(userData).id;
    }

    this.loadData();

    // مراقبة البحث
    const filterSub = this.filter.valueChanges
      .pipe(
        debounceTime(300),
        tap((val) => this.applyFilter(val)),
      )
      .subscribe();

    this.destroyRef.onDestroy(() => filterSub.unsubscribe());
  }

  loadData() {
    const sub = this.detainedService.all().subscribe({
      next: (res: any[]) => {
        // ✅ تم تحديد النوع هنا لحل خطأ "implicitly has any type"
        this.list = res;
        this.filteredList = res;
        this.updateDisplayedData();
      },
      error: () =>
        this.notify.showMessage({
          message: 'فشل تحميل قائمة الرخص المحتجزة',
          status: 'failed',
        }),
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  applyFilter(value: string) {
    const search = value.toLowerCase().trim();
    this.filteredList = this.list.filter(
      (item) =>
        item.fullName.toLowerCase().includes(search) ||
        item.nationalNo.toLowerCase().includes(search) ||
        item.licenseID.toString().includes(search),
    );
    this.currentPage = 1;
    this.updateDisplayedData();
  }

  updateDisplayedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.displayedData = this.filteredList.slice(start, start + this.pageSize);
  }

  onRelease(id: number) {
    this.licenseID = id;
    this.isDialogVisible.set(true);
  }

  onDialogResult(confirmed: boolean) {
    this.isDialogVisible.set(false);
    if (confirmed && this.licenseID && this.current_user_id) {
      this.licenseService
        .release(this.licenseID, this.current_user_id)
        .subscribe({
          next: () => {
            this.notify.showMessage({
              message: `تم فك حجز الرخصة رقم ${this.licenseID} بنجاح`,
              status: 'success',
            });
            this.loadData();
          },
          error: (err: any) =>
            this.notify.showMessage({
              message: 'فشل فك الحجز: ' + err.message,
              status: 'failed',
            }),
        });
    }
  }

  onNext() {
    if (this.currentPage * this.pageSize < this.filteredList.length) {
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
}
