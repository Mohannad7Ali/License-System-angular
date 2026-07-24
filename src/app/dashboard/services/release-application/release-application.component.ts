import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, tap, switchMap, catchError, of } from 'rxjs';

import { LicenseService } from '../../../services/license.service';
import { DetainedLicenseService } from '../../../services/detained-license.service';
import { DriverService } from '../../../services/driver.service';
import { NotificationService } from '../../../services/notification.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { License } from '../../../models/license.model';
import { DetainedLicense } from '../../../models/detained-license.model';

@Component({
  selector: 'app-release-application',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './release-application.component.html',
  styleUrl: './release-application.component.css',
})
export class ReleaseApplicationComponent implements OnDestroy {
  // الخدمات
  private licenseService = inject(LicenseService);
  private detainedService = inject(DetainedLicenseService);
  private driverService = inject(DriverService);
  private notify = inject(NotificationService);
  private userService = inject(CurrentUserService);

  // Signals لإدارة حالة الواجهة
  searchControl = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(1),
  ]);
  licenseData = signal<License | null>(null);
  detainInfo = signal<DetainedLicense | null>(null);
  applicantName = signal<string>('');
  isSubmitting = signal(false);

  // ثوابت الرسوم
  readonly releaseApplicationFee = 15;

  private destroy$ = new Subject<void>();

  onSearch() {
    if (this.searchControl.invalid) return;

    const licenseId = this.searchControl.value!;

    this.licenseService
      .read(licenseId)
      .pipe(
        takeUntil(this.destroy$),
        tap((license) => this.licenseData.set(license)),
        // جلب اسم السائق
        switchMap((license) =>
          this.driverService.read(license.driverID).pipe(
            tap((driver) => this.applicantName.set(driver.fullName)),
            catchError(() => of(null)),
          ),
        ),
        // التحقق من حالة الحجز وجلب تفاصيله
        switchMap(() => this.licenseService.isDetained(licenseId)),
        switchMap((isDetained) => {
          if (!isDetained) {
            this.notify.showMessage({
              message: 'هذه الرخصة ليست محجوزة!',
              status: 'failed',
            });
            this.detainInfo.set(null);
            return of(null);
          }
          return this.detainedService
            .read(licenseId)
            .pipe(tap((info) => this.detainInfo.set(info)));
        }),
        catchError((err) => {
          this.notify.showMessage({
            message: 'خطأ في جلب البيانات: ' + err.message,
            status: 'failed',
          });
          return of(null);
        }),
      )
      .subscribe();
  }

  onRelease() {
    if (!this.detainInfo() || this.isSubmitting()) return;

    if (confirm('هل أنت متأكد من فك حجز هذه الرخصة ودفع الرسوم؟')) {
      this.isSubmitting.set(true);
      const userId = this.userService.getCurrentUser()?.id || 1;

      this.licenseService
        .release(this.licenseData()!.id, userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.notify.showMessage({
                message: 'تم فك حجز الرخصة بنجاح',
                status: 'success',
              });
              this.onSearch(); // تحديث البيانات المعروضة
            }
            this.isSubmitting.set(false);
          },
          error: (err) => {
            this.notify.showMessage({
              message: 'فشل فك الحجز: ' + err.message,
              status: 'failed',
            });
            this.isSubmitting.set(false);
          },
        });
    }
  }

  onReset() {
    this.searchControl.reset();
    this.licenseData.set(null);
    this.detainInfo.set(null);
    this.applicantName.set('');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
