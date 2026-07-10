import { Component, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';
import { TestTypesService } from '../../../services/test-type.service';
import { TestType } from '../../../models/test-type.model';
import { DatePipe, CommonModule } from '@angular/common';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { NotificationService } from '../../../services/notification.service';
import { NotificationComponent } from '../../../shared/notification/notification.component';

@Component({
  selector: 'app-manage-appointments',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    RouterLink,
    ConfirmationDialogComponent,
    NotificationComponent,
  ],
  templateUrl: './manage-appointments.component.html',
  styleUrl: './manage-appointments.component.css',
})
export class ManageAppointmentsComponent implements OnInit, OnDestroy {
  currentPage = 1;
  pageSize = 6;

  localApplicationId: number | null = null;
  testTypeId: number | null = null;

  appointments = signal<any[]>([]);
  filteredAppointments = signal<any[]>([]);
  testTypesArr = signal<TestType[]>([]);

  isLoading = signal(true);
  filter = new FormControl('', { nonNullable: true });
  isDeleteDialogVisible = signal(false);
  currentAppointmentToDelete: any = null;

  private destroy$ = new Subject<void>();

  private appointmentService = inject(AppointmentService);
  private testTypeService = inject(TestTypesService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    // 1. جلب أنواع الاختبارات أولاً لضمان وجود الأسماء عند العرض
    this.testTypeService
      .all()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (types) => {
          this.testTypesArr.set(types);
          this.initParams();
        },
        error: () => this.initParams(),
      });

    this.filter.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe((val) => this.applyFilter(val));
  }

  private initParams() {
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.localApplicationId = params['localApplicationId']
          ? +params['localApplicationId']
          : null;
        this.testTypeId = params['testTypeId'] ? +params['testTypeId'] : null;
        this.loadAppointments();
      });
  }

  loadAppointments() {
    this.isLoading.set(true);
    let request;
    if (this.localApplicationId && this.testTypeId) {
      request = this.appointmentService.getAppointmentsPerTestType(
        this.localApplicationId,
        this.testTypeId,
      );
    } else {
      request = this.appointmentService.appointments();
    }

    request.pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any[]) => {
        const mapped = response.map((app) => ({
          id: app.testAppointmentID || app.id,
          fullName: app.fullName,
          localLicenseApplicationID:
            app.localDrivingLicenseApplicationID || app.localApplicationID,
          isLocked: app.isLocked,
          date: app.appointmentDate || app.date,
          testTypeID: app.testTypeID || app.testType,
          testTypeTitle: app.testTypeTitle,
        }));
        this.appointments.set(mapped);
        this.applyFilter(this.filter.value);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  // ✅ حل مشكلة الاسم الفارغ: جلب الاسم من القائمة المحلية إذا نقص من السيرفر
  getTestName(app: any): string {
    if (app.testTypeTitle) return app.testTypeTitle;
    const found = this.testTypesArr().find((t) => t.id === app.testTypeID);
    return found ? found.testTypeTitle : `اختبار #${app.testTypeID}`;
  }

  applyFilter(value: string) {
    const search = value.toLowerCase().trim();
    const result = this.appointments().filter(
      (app) =>
        app.fullName.toLowerCase().includes(search) ||
        app.id.toString().includes(search),
    );
    this.filteredAppointments.set(result);
    this.currentPage = 1;
  }

  get displayedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredAppointments().slice(start, start + this.pageSize);
  }

  onNext() {
    if (this.currentPage * this.pageSize < this.filteredAppointments().length)
      this.currentPage++;
  }
  onPrevious() {
    if (this.currentPage > 1) this.currentPage--;
  }

  onDeleteClick(appointment: any) {
    this.currentAppointmentToDelete = appointment;
    this.isDeleteDialogVisible.set(true);
  }

  onDeleteDialogResult(confirmed: boolean) {
    this.isDeleteDialogVisible.set(false);
    if (confirmed && this.currentAppointmentToDelete) {
      this.appointmentService
        .delete(this.currentAppointmentToDelete.id)
        .subscribe({
          next: () => {
            this.notificationService.showMessage({
              message: 'تم حذف الموعد بنجاح',
              status: 'success',
            });
            this.loadAppointments();
          },
          error: (err) =>
            this.notificationService.showMessage({
              message: 'خطأ: ' + err.message,
              status: 'failed',
            }),
        });
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
