import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  forkJoin,
  Subject,
  switchMap,
  tap,
  takeUntil,
  debounceTime,
} from 'rxjs';

import { DriverService } from '../../../../services/driver.service';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'app-licenses-history',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './licenses-history.component.html',
  styleUrl: './licenses-history.component.css',
})
export class LicensesHistoryComponent implements OnInit, OnDestroy {
  id: number | undefined = undefined;
  current_driver: any = undefined;
  person_id: number | undefined = undefined;
  loading = signal<boolean>(true);

  localLicenses: any[] = [];
  internationalLicenses: any[] = [];

  filteredLocalLicenses: any[] = [];
  filteredInternationalLicenses: any[] = [];

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

  // Getter لحساب الرخص النشطة ديناميكياً
  get activeLicensesCount(): number {
    const activeLocal = this.localLicenses.filter((l) => l.isActive).length;
    const activeInter = this.internationalLicenses.filter(
      (l) => l.isActive,
    ).length;
    return activeLocal + activeInter;
  }

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.id = +params['id'];
        if (this.id) this.getDriverData();
      });

    this.filter.valueChanges
      .pipe(debounceTime(300), takeUntil(this.destroy$))
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
        error: () => {
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

    this.filteredLocalLicenses = this.localLicenses.filter(
      (l) =>
        l.licenseID.toString().includes(search) ||
        l.class.toLowerCase().includes(search) ||
        l.applicationID.toString().includes(search),
    );

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
