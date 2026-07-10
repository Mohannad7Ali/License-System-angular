import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime } from 'rxjs';

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
  private detainedService = inject(DetainedLicenseService);
  private licenseService = inject(LicenseService);
  private notify = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  // سنعود لاستخدام المصفوفات العادية مؤقتاً لأنها كانت تعمل عندك
  list: any[] = [];
  filteredList: any[] = [];
  displayedData: any[] = [];

  currentPage = 1;
  pageSize = 6;
  filter = new FormControl('', { nonNullable: true });

  isLoading = signal(true);
  isReleaseDialogVisible = signal(false);
  selectedLicenseId = signal<number | null>(null);

  ngOnInit(): void {
    this.loadData();

    // مراقبة البحث
    const sub = this.filter.valueChanges
      .pipe(debounceTime(300))
      .subscribe((val) => {
        this.applyFilter(val);
      });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  loadData() {
    this.isLoading.set(true);
    // تأكد أن detainedService.all() تستدعي المسار الصحيح
    this.detainedService.all().subscribe({
      next: (res: any) => {
        // نضع check للتأكد أن القادمة مصفوفة
        this.list = Array.isArray(res) ? res : [];
        this.filteredList = [...this.list];
        this.updateDisplayedData();
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('API Error:', err); // سيظهر لك الخطأ الحقيقي في الكونسول
        this.notify.showMessage({
          message: 'فشل تحميل قائمة الرخص المحتجزة',
          status: 'failed',
        });
        this.isLoading.set(false);
      },
    });
  }

  applyFilter(value: string) {
    const search = value.toLowerCase().trim();
    this.filteredList = this.list.filter(
      (item) =>
        item.fullName?.toLowerCase().includes(search) ||
        item.licenseID?.toString().includes(search),
    );
    this.currentPage = 1;
    this.updateDisplayedData();
  }

  updateDisplayedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.displayedData = this.filteredList.slice(start, start + this.pageSize);
  }

  // دوال الترقيم
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

  // فك الحجز
  onReleaseRequest(licenseId: number) {
    this.selectedLicenseId.set(licenseId);
    this.isReleaseDialogVisible.set(true);
  }

  onDialogResult(confirmed: boolean) {
    this.isReleaseDialogVisible.set(false);
    if (confirmed && this.selectedLicenseId()) {
      const userData = localStorage.getItem('current-user');
      const userId = userData ? JSON.parse(userData).id : 1;

      this.licenseService.release(this.selectedLicenseId()!, userId).subscribe({
        next: () => {
          this.notify.showMessage({
            message: 'تم فك حجز الرخصة بنجاح',
            status: 'success',
          });
          this.loadData();
        },
        error: (err) =>
          this.notify.showMessage({
            message: 'فشل العملية: ' + err.message,
            status: 'failed',
          }),
      });
    }
  }
}
