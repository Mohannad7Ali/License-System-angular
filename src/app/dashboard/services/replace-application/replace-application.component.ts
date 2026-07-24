import { Component, inject, signal, OnDestroy, OnInit } from '@angular/core';
import { CommonModule, CurrencyPipe, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subject, takeUntil, tap, switchMap, catchError, of } from 'rxjs';

import { LicenseService } from '../../../services/license.service';
import { DriverService } from '../../../services/driver.service';
import { NotificationService } from '../../../services/notification.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { License } from '../../../models/license.model';
import { Driver_View } from '../../../models/driver.model';

@Component({
  selector: 'app-replace-application',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, CurrencyPipe, DatePipe],
  templateUrl: './replace-application.component.html',
  styleUrl: './replace-application.component.css',
})
export class ReplaceApplicationComponent implements OnInit, OnDestroy {
  private licenseService = inject(LicenseService);
  private driverService = inject(DriverService);
  private notify = inject(NotificationService);
  private userService = inject(CurrentUserService);

  // التحكم بالواجهة
  searchControl = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(1),
  ]);
  replaceMode = new FormControl<'Damaged' | 'Lost'>('Damaged', {
    nonNullable: true,
  });

  // Signals
  oldLicense = signal<License | null>(null);
  newLicense = signal<License | null>(null);
  applicantName = signal<string>('');
  isSubmitting = signal(false);

  // رسوم الخدمات
  readonly damagedFee = 5.0;
  readonly lostFee = 10.0;

  private destroy$ = new Subject<void>();

  ngOnInit() {}

  get currentFee(): number {
    return this.replaceMode.value === 'Damaged'
      ? this.damagedFee
      : this.lostFee;
  }

  onSearch() {
    if (this.searchControl.invalid) return;
    const id = this.searchControl.value!;

    this.licenseService
      .read(id)
      .pipe(
        takeUntil(this.destroy$),
        tap((license: License) => {
          if (!license.isActive) {
            throw new Error('هذه الرخصة غير نشطة، لا يمكن إصدار بدل لها!');
          }
          this.oldLicense.set(license);
        }),
        switchMap((license: License) =>
          this.driverService.read(license.driverID),
        ),
        tap((driver: Driver_View) => this.applicantName.set(driver.fullName)),
        catchError((err: any) => {
          this.notify.showMessage({
            message: err.message || 'الرخصة غير موجودة',
            status: 'failed',
          });
          this.oldLicense.set(null);
          return of(null);
        }),
      )
      .subscribe();
  }

  onReplace() {
    if (!this.oldLicense() || this.isSubmitting()) return;

    const modeText =
      this.replaceMode.value === 'Damaged' ? 'بدل تالف' : 'بدل فاقد';
    if (confirm(`هل أنت متأكد من إصدار ${modeText} لهذه الرخصة؟`)) {
      this.isSubmitting.set(true);
      const userId = this.userService.getCurrentUser()?.id || 1;
      const licenseId = this.oldLicense()!.id;

      const replacement$ =
        this.replaceMode.value === 'Damaged'
          ? this.licenseService.damageReplacement(licenseId, userId)
          : this.licenseService.lostReplacement(licenseId, userId);

      replacement$.pipe(takeUntil(this.destroy$)).subscribe({
        next: (newLic: License) => {
          this.newLicense.set(newLic);
          this.notify.showMessage({
            message: `تم إصدار ${modeText} بنجاح!`,
            status: 'success',
          });
          this.isSubmitting.set(false);
          this.searchControl.disable();
        },
        error: (err: any) => {
          this.notify.showMessage({
            message: 'فشل الإصدار: ' + err.message,
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
    this.oldLicense.set(null);
    this.newLicense.set(null);
    this.applicantName.set('');
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
