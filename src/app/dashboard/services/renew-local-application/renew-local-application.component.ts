import { Component, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Subject,
  takeUntil,
  tap,
  switchMap,
  catchError,
  of,
  forkJoin,
} from 'rxjs';

import { LicenseService } from '../../../services/license.service';
import { DriverService } from '../../../services/driver.service';
import { LicenseClassService } from '../../../services/license-class.service';
import { NotificationService } from '../../../services/notification.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { License } from '../../../models/license.model';
import { Driver_View } from '../../../models/driver.model';
import { LicenseClass } from '../../../models/license-class.model';

@Component({
  selector: 'app-renew-local-application',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './renew-local-application.component.html',
  styleUrl: './renew-local-application.component.css',
})
export class RenewLocalApplicationComponent implements OnInit, OnDestroy {
  private licenseService = inject(LicenseService);
  private driverService = inject(DriverService);
  private classService = inject(LicenseClassService);
  private notify = inject(NotificationService);
  private userService = inject(CurrentUserService);

  searchControl = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(1),
  ]);
  notesControl = new FormControl('');

  oldLicense = signal<License | null>(null);
  newLicense = signal<License | null>(null);
  applicantName = signal<string>('');
  classFees = signal<number>(0);
  isSubmitting = signal(false);

  readonly renewAppFee = 7.0;

  private destroy$ = new Subject<void>();

  ngOnInit() {}

  onSearch() {
    if (this.searchControl.invalid) return;

    const licenseId = this.searchControl.value!;

    this.licenseService
      .read(licenseId)
      .pipe(
        takeUntil(this.destroy$),
        tap((license: License) => {
          if (!license.isActive) {
            throw new Error('هذه الرخصة غير نشطة، لا يمكن تجديدها!');
          }

          const expirationDate = new Date(license.expDate);
          if (expirationDate > new Date()) {
            throw new Error('الرخصة لم تنتهِ صلاحيتها بعد، لا داعي للتجديد!');
          }

          this.oldLicense.set(license);
        }),
        switchMap((license: License) =>
          forkJoin({
            driver: this.driverService.read(license.driverID),
            licenseClass: this.classService.getLicenseClass(
              license.licenseClass,
            ),
          }),
        ),
        tap((res: { driver: Driver_View; licenseClass: LicenseClass }) => {
          this.applicantName.set(res.driver.fullName);
          this.classFees.set(res.licenseClass.fees);
        }),
        catchError((err: any) => {
          this.notify.showMessage({
            message: err.message || 'حدث خطأ في البحث',
            status: 'failed',
          });
          this.oldLicense.set(null);
          return of(null);
        }),
      )
      .subscribe();
  }

  onRenew() {
    if (!this.oldLicense() || this.isSubmitting()) return;

    if (confirm('هل أنت متأكد من رغبتك في تجديد هذه الرخصة؟')) {
      this.isSubmitting.set(true);
      const userId = this.userService.getCurrentUser()?.id || 1;
      const notes = this.notesControl.value || '';

      this.licenseService
        .renew(this.oldLicense()!.id, notes, userId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (newLic: License) => {
            this.newLicense.set(newLic);
            this.notify.showMessage({
              message: 'تم تجديد الرخصة بنجاح!',
              status: 'success',
            });
            this.isSubmitting.set(false);
            this.searchControl.disable();
          },
          error: (err: any) => {
            this.notify.showMessage({
              message: 'فشل التجديد: ' + err.message,
              status: 'failed',
            });
            this.isSubmitting.set(false);
          },
        });
    }
  }

  onReset() {
    this.searchControl.enable();
    this.searchControl.reset();
    this.notesControl.reset();
    this.oldLicense.set(null);
    this.newLicense.set(null);
    this.applicantName.set('');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
