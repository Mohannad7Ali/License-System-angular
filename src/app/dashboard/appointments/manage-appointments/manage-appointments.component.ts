import { Component, DestroyRef, inject, OnInit, signal, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, RouterLink, NavigationEnd } from '@angular/router';
import { Subject, takeUntil, tap, filter } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AppointmentService } from '../../../services/appointment.service';
import { TestType } from '../../../models/test-type.model';
import { TestTypesService } from '../../../services/test-type.service';
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
  // الترقيم
  currentPage = 1;
  pageSize = 6;

  // المعطيات
  localApplicationId: number | null = null;
  testTypeId: number | null = null;

  appointments: any[] = [];
  filteredappointments: any[] = [];
  displayedData: any[] = [];

  // أدوات التحكم
  filter = new FormControl('', { nonNullable: true });
  isDeleteDialogVisible = signal(false);
  currentAppointmentToDelete: any = null;
  private destroy$ = new Subject<void>();
  current_date = new Date();

  // حقن الخدمات
  private appointmentService = inject(AppointmentService);
  private notificationService = inject(NotificationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  ngOnInit(): void {
    // جلب البارامترات من الرابط
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.localApplicationId = params['localApplicationId'] ? +params['localApplicationId'] : null;
      this.testTypeId = params['testTypeId'] ? +params['testTypeId'] : null;
      this.loadAppointments();
    });

    // مراقبة البحث
    this.filter.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(val => this.applyFilter(val));
  }

  loadAppointments() {
    let request;
    if (this.localApplicationId && this.testTypeId) {
      request = this.appointmentService.getAppointmentsPerTestType(this.localApplicationId, this.testTypeId);
    } else {
      request = this.appointmentService.appointments();
    }

    request.subscribe({
      next: (response: any[]) => {
        this.appointments = response.map(app => ({
          id: app.testAppointmentID || app.id,
          fullName: app.fullName,
          localLicenseApplicationID: app.localDrivingLicenseApplicationID || app.localApplicationID,
          isLocked: app.isLocked,
          date: app.appointmentDate || app.date,
          testTypeTitle: app.testTypeTitle
        }));
        this.filteredappointments = [...this.appointments];
        this.updateDisplayedData();
      }
    });
  }

  applyFilter(value: string) {
    const search = value.toLowerCase().trim();
    this.filteredappointments = this.appointments.filter(app => 
      app.fullName.toLowerCase().includes(search) || app.id.toString().includes(search)
    );
    this.currentPage = 1;
    this.updateDisplayedData();
  }

  updateDisplayedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.displayedData = this.filteredappointments.slice(start, start + this.pageSize);
  }

  onNext() { if (this.currentPage * this.pageSize < this.filteredappointments.length) { this.currentPage++; this.updateDisplayedData(); } }
  onPrevious() { if (this.currentPage > 1) { this.currentPage--; this.updateDisplayedData(); } }

  onDeleteClick(appointment: any) {
    this.currentAppointmentToDelete = appointment;
    this.isDeleteDialogVisible.set(true);
  }

  onDeleteDialogResult(confirmed: boolean) {
    this.isDeleteDialogVisible.set(false);
    if (confirmed && this.currentAppointmentToDelete) {
      this.appointmentService.delete(this.currentAppointmentToDelete.id).subscribe({
        next: () => {
          this.notificationService.showMessage({ message: 'تم حذف الموعد بنجاح', status: 'success' });
          this.loadAppointments();
        },
        error: (err) => this.notificationService.showMessage({ message: 'خطأ: ' + err.message, status: 'failed' })
      });
    }
  }

  // دالة مساعدة لمقارنة التواريخ في الـ HTML (اختياري)
  isToday(date: any): boolean {
    const d = new Date(date);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}