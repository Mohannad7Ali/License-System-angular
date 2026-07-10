import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  forkJoin,
  Subscription,
  Subject,
  switchMap,
  tap,
  takeUntil,
  debounceTime,
} from 'rxjs';

import { DialogWrapperComponent } from '../../../../shared/dialog-wrapper/dialog-wrapper.component';
import { DriverService } from '../../../../services/driver.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-licenses-history',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    DialogWrapperComponent,
    DatePipe,
  ],
  templateUrl: './licenses-history.component.html',
  styleUrl: './licenses-history.component.css',
})
export class LicensesHistoryComponent implements OnInit, OnDestroy {
  // المعرفات والحالات
  id: number | undefined = undefined;
  current_driver: any = undefined;
  person_id: number | undefined = undefined;
  loading = signal<boolean>(true);

  // مصفوفات البيانات الأصلية
  localLicenses: any[] = [];
  internationalLicenses: any[] = [];

  // مصفوفات البيانات المفلترة للبحث
  filteredLocalLicenses: any[] = [];
  filteredInternationalLicenses: any[] = [];

  // عناصر التحكم
  licenses = new FormControl<'local' | 'international'>('local', {
    validators: Validators.required,
    nonNullable: true,
  });

  filter = new FormControl('', { nonNullable: true });

  private destroy$ = new Subject<void>();
  private route = inject(ActivatedRoute);
  private driverServ = inject(DriverService);
  private noifyServ = inject(NotificationService);
  private location = inject(Location);

  ngOnInit(): void {
    // جلب معرف السائق من الرابط
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.id = +params['id'];
        if (this.id) this.getDriverData();
      });

    // إعداد مراقب البحث (Filter)
    this.filter.valueChanges
      .pipe(
        debounceTime(300), // انتظر 300 مللي ثانية لتحسين الأداء
        takeUntil(this.destroy$),
      )
      .subscribe((value) => {
        this.applyFilter(value);
      });
  }

  getDriverData() {
    this.loading.set(true);
    this.driverServ
      .read(this.id!)
      .pipe(
        tap((driver) => {
          this.current_driver = driver;
          this.person_id = driver.personID;
        }),
        switchMap(() =>
          forkJoin({
            local: this.driverServ.localLicenses(this.id!),
            inter: this.driverServ.internationalLicenses(this.id!),
          }),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (res) => {
          this.localLicenses = res.local;
          this.filteredLocalLicenses = res.local;

          this.internationalLicenses = res.inter;
          this.filteredInternationalLicenses = res.inter;

          this.loading.set(false);
        },
        error: (err) => {
          this.noifyServ.showMessage({
            message: 'فشل في تحميل سجلات الرخص',
            status: 'failed',
          });
          this.loading.set(false);
        },
      });
  }

  applyFilter(value: string) {
    const search = value.toLowerCase().trim();

    // فلترة الرخص المحلية
    this.filteredLocalLicenses = this.localLicenses.filter(
      (l) =>
        l.licenseID.toString().includes(search) ||
        l.class.toLowerCase().includes(search) ||
        l.applicationID.toString().includes(search),
    );

    // فلترة الرخص الدولية
    this.filteredInternationalLicenses = this.internationalLicenses.filter(
      (l) =>
        l.licenseID.toString().includes(search) ||
        l.issuedUsingLocalLicenseID.toString().includes(search),
    );
  }

  onCancel() {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
