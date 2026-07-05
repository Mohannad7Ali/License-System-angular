import {
  Component,
  Input,
  OnInit,
  Output,
  signal,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  OnDestroy,
  Inject,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  isPlatformBrowser,
} from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject, forkJoin, switchMap, takeUntil, tap, of } from 'rxjs';

import { TestType } from '../../../models/test-type.model';
import { TestTypesService } from '../../../services/test-type.service';
import { LocalApplicationService } from '../../../services/local-application.service';
import { ApplicationService } from '../../../services/application.service';
import { AppointmentService } from '../../../services/appointment.service';
import { NotificationService } from '../../../services/notification.service';
import {
  enApplicationStatus,
  enApplicationType,
} from '../../../models/application.model';
import { enLicenseClass } from '../../../models/license-class.model';
import { NotificationComponent } from '../../../shared/notification/notification.component';

export enum enMode {
  add = 'Add',
  edit = 'Edit',
}

@Component({
  selector: 'app-make-appointment',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    CurrencyPipe,
    NotificationComponent,
  ],
  templateUrl: './make-appointment.component.html',
  styleUrl: './make-appointment.component.css',
})
export class MakeAppointmentComponent implements OnInit, OnChanges, OnDestroy {
  @Output() closed = new EventEmitter<boolean>();
  @Input() applicationID: number | null = null;
  @Input() appointmentID_to_edit: number | null = null;

  appointments_mode = enMode.add;
  enMode = enMode;

  current_local_application = signal<any>(null);
  current_main_application = signal<any>(null);
  applicantName = signal<string>('');
  testCount = signal<number>(0);
  testTypeID = signal<number | undefined>(undefined);
  schadualed = signal<boolean>(false);

  filter = new FormControl<number | undefined>(undefined, [
    Validators.required,
  ]);
  appointmentDate = new FormControl('', [Validators.required]);

  testTypes: TestType[] = [];
  current_user_id = signal<number>(1);
  current_date = new Date();
  private destroy$ = new Subject<void>();

  private apppointmentService = inject(AppointmentService);
  private testTypeService = inject(TestTypesService);
  private localAppService = inject(LocalApplicationService);
  private mainAppService = inject(ApplicationService);
  private notify = inject(NotificationService);

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    this.loadInitialData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // تحديث الوضع فور تغير الـ Inputs القادمة من الأب
    this.checkInitialMode();
  }

  private loadInitialData() {
    this.testTypeService
      .all()
      .pipe(takeUntil(this.destroy$))
      .subscribe((res) => (this.testTypes = res));

    if (isPlatformBrowser(this.platformId)) {
      const user = localStorage.getItem('current-user');
      if (user) this.current_user_id.set(JSON.parse(user).id);
    }
  }

  private checkInitialMode() {
    // 🎯 إذا جاء ID موعد، فنحن حتماً في وضع تعديل
    if (this.appointmentID_to_edit && this.appointmentID_to_edit !== 0) {
      this.appointments_mode = enMode.edit;
    } else {
      this.appointments_mode = enMode.add;
    }

    // تعبئة الفلتر والبحث تلقائياً إذا جاء ID طلب
    if (this.applicationID && this.applicationID !== 0) {
      this.filter.setValue(this.applicationID);
      this.onSearch();
    }
  }

  onSearch() {
    if (!this.filter.value) return;
    const id = Number(this.filter.value);

    this.localAppService
      .read(id)
      .pipe(
        tap((local) => this.current_local_application.set(local)),
        switchMap((local) =>
          this.mainAppService.read(local.applicationID).pipe(
            switchMap((main) => {
              this.current_main_application.set(main);
              return forkJoin({
                nameData: this.localAppService.readView(id),
                count: this.localAppService.passedTestCount(id),
              });
            }),
            tap(({ nameData, count }) => {
              this.applicantName.set(nameData.fullName);
              this.testCount.set(count);

              if (this.appointments_mode === enMode.add) {
                this.testTypeID.set(count >= 3 ? undefined : count);
              } else {
                // في وضع التعديل، سنعتمد على البيانات القادمة من السيرفر للموعد
                this.testTypeID.set(count);
              }
            }),
          ),
        ),
        takeUntil(this.destroy$),
      )
      .subscribe({
        error: () =>
          this.notify.showMessage({
            message: 'الطلب غير موجود',
            status: 'failed',
          }),
      });
  }

  onSchedule() {
    if (this.appointmentDate.invalid) {
      this.notify.showMessage({
        message: 'يرجى اختيار التاريخ',
        status: 'failed',
      });
      return;
    }

    const selectedDate = new Date(this.appointmentDate.value!).toISOString();

    if (this.appointments_mode === enMode.edit && this.appointmentID_to_edit) {
      // ✅ تعديل: PUT update-date
      this.apppointmentService
        .updateDate(this.appointmentID_to_edit, selectedDate)
        .subscribe({
          next: () => {
            this.notify.showMessage({
              message: 'تم تحديث الموعد بنجاح',
              status: 'success',
            });
            this.schadualed.set(true);
            setTimeout(() => this.onClosed(), 1000);
          },
          error: (err) =>
            this.notify.showMessage({
              message: 'فشل التحديث: ' + err.message,
              status: 'failed',
            }),
        });
    } else {
      // ✅ إضافة: POST create
      const payload: any = {
        testAppointmentID: 0,
        testTypeID: (this.testTypeID() ?? 0) + 1,
        localDrivingLicenseApplicationID: this.current_local_application().id,
        appointmentDate: selectedDate,
        paidFees: this.testTypes[this.testTypeID() ?? 0].testTypeFees,
        createdByUserID: this.current_user_id() || 1,
        isLocked: false,
      };

      this.apppointmentService.create(payload).subscribe({
        next: () => {
          this.notify.showMessage({
            message: 'تم حجز الموعد بنجاح',
            status: 'success',
          });
          this.schadualed.set(true);
          setTimeout(() => this.onClosed(), 1000);
        },
        error: (err) =>
          this.notify.showMessage({
            message: 'فشل الحجز: ' + err.message,
            status: 'failed',
          }),
      });
    }
  }

  onReset() {
    this.filter.reset();
    this.applicantName.set('');
    this.schadualed.set(false);
  }

  onClosed() {
    this.closed.emit(true);
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
