import { Component, inject, signal, OnDestroy } from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  Location,
} from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, tap, switchMap, catchError, of } from 'rxjs';

import { LicenseService } from '../../../services/license.service';
import { DetainedLicenseService } from '../../../services/detained-license.service';
import { DriverService } from '../../../services/driver.service';
import { NotificationService } from '../../../services/notification.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { License } from '../../../models/license.model';

@Component({
  selector: 'app-detain-license',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './detain-license.component.html',
  styleUrl: './detain-license.component.css',
})
export class DetainLicenseComponent implements OnDestroy {
  private licenseService = inject(LicenseService);
  private detainedService = inject(DetainedLicenseService);
  private driverService = inject(DriverService);
  private notify = inject(NotificationService);
  private userService = inject(CurrentUserService);
  private location = inject(Location);

  searchControl = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(1),
  ]);
  fineControl = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(0),
  ]);

  licenseData = signal<License | null>(null);
  applicantName = signal<string>('');
  isSubmitting = signal(false);
  detainSuccessId = signal<number | null>(null);

  today = new Date();
  private destroy$ = new Subject<void>();

  onSearch() {
    if (this.searchControl.invalid) return;
    const licenseId = this.searchControl.value!;

    this.licenseService
      .read(licenseId)
      .pipe(
        takeUntil(this.destroy$),
        tap((license) => {
          if (!license.isActive) throw new Error('هذه الرخصة غير نشطة!');
          this.licenseData.set(license);
        }),
        switchMap(() => this.licenseService.isDetained(licenseId)),
        tap((isDetained) => {
          if (isDetained) {
            this.licenseData.set(null);
            throw new Error('الرخصة محجوزة بالفعل!');
          }
        }),
        switchMap(() => this.driverService.read(this.licenseData()!.driverID)),
        tap((driver) => this.applicantName.set(driver.fullName)),
        catchError((err) => {
          this.notify.showMessage({
            message: err.message || 'خطأ في جلب البيانات',
            status: 'failed',
          });
          this.licenseData.set(null);
          return of(null);
        }),
      )
      .subscribe();
  }

  onDetain() {
    if (this.fineControl.invalid || !this.licenseData() || this.isSubmitting())
      return;

    this.isSubmitting.set(true);
    const userId = this.userService.getCurrentUser()?.id || 1;

    const detainPayload: any = {
      licenseID: this.licenseData()!.id,
      detainDate: new Date(),
      fineFees: this.fineControl.value!,
      createdByUserID: userId,
      isReleased: false,
    };

    this.detainedService
      .create(detainPayload)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.detainSuccessId.set(res.id || 0);
          this.notify.showMessage({
            message: 'تم حجز الرخصة بنجاح!',
            status: 'success',
          });
          this.isSubmitting.set(false);
          this.searchControl.disable();
          this.fineControl.disable();
        },
        error: (err) => {
          this.notify.showMessage({
            message: 'فشل الحجز: ' + err.message,
            status: 'failed',
          });
          this.isSubmitting.set(false);
        },
      });
  }

  goBack() {
    this.location.back();
  }

  onReset() {
    this.searchControl.enable();
    this.fineControl.enable();
    this.searchControl.reset();
    this.fineControl.reset();
    this.licenseData.set(null);
    this.detainSuccessId.set(null);
    this.applicantName.set('');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
