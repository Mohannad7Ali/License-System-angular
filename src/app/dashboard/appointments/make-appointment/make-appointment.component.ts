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
  inject,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import {
  CommonModule,
  CurrencyPipe,
  DatePipe,
  isPlatformBrowser,
} from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  Subject,
  forkJoin,
  switchMap,
  takeUntil,
  tap,
  catchError,
  of,
} from 'rxjs';

import { TestType } from '../../../models/test-type.model';
import { TestTypesService } from '../../../services/test-type.service';
import { LocalApplicationService } from '../../../services/local-application.service';
import { ApplicationService } from '../../../services/application.service';
import { AppointmentService } from '../../../services/appointment.service';
import { NotificationService } from '../../../services/notification.service';
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
  applicantName = signal<string>('');
  testCount = signal<number>(0);
  testTypeID = signal<number | undefined>(undefined);
  schadualed = signal<boolean>(false);
  isSubmitting = signal(false);
  current_date = new Date();
  filter = new FormControl<number | undefined>(undefined, [
    Validators.required,
  ]);
  appointmentDate = new FormControl('', [Validators.required]);

  testTypes: TestType[] = [];
  current_user_id = signal<number>(1);
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
    this.appointments_mode =
      this.appointmentID_to_edit && this.appointmentID_to_edit !== 0
        ? enMode.edit
        : enMode.add;
    if (this.applicationID) {
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
        takeUntil(this.destroy$),
        tap((local) => this.current_local_application.set(local)),
        switchMap((local) =>
          forkJoin({
            view: this.localAppService.readView(id),
            count: this.localAppService.passedTestCount(id),
          }),
        ),
        tap(({ view, count }) => {
          this.applicantName.set(view.fullName);
          this.testCount.set(count);
          // في الـ Add، النوع التالي هو عدد الاختبارات الناجحة (مثلاً نجح في 0، يعني الاختبار التالي هو النوع رقم 0 في المصفوفة)
          this.testTypeID.set(count);
        }),
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
    if (this.appointmentDate.invalid || this.isSubmitting()) return;

    const nextTestIndex = this.testTypeID() ?? 0;

    // ✅ حماية: منع حجز اختبار إذا كان قد نجح في كل أنواع الاختبارات المتاحة
    if (
      this.appointments_mode === enMode.add &&
      nextTestIndex >= this.testTypes.length
    ) {
      this.notify.showMessage({
        message: 'عذراً، هذا المتقدم أكمل جميع الاختبارات المتاحة بنجاح',
        status: 'failed',
      });
      return;
    }

    const selectedDate = new Date(this.appointmentDate.value!).toISOString();
    this.isSubmitting.set(true);

    if (this.appointments_mode === enMode.edit && this.appointmentID_to_edit) {
      this.apppointmentService
        .updateDate(this.appointmentID_to_edit, selectedDate)
        .subscribe({
          next: () => this.handleSuccess('تم تحديث الموعد بنجاح'),
          error: (err) => this.handleError(err),
        });
    } else {
      // ✅ الـ Payload الصحيح: إرسال ID الاختبار (Index + 1)
      const payload: any = {
        testAppointmentID: 0,
        testTypeID: nextTestIndex + 1,
        localDrivingLicenseApplicationID: this.current_local_application().id,
        appointmentDate: selectedDate,
        paidFees: this.testTypes[nextTestIndex]?.testTypeFees || 0,
        createdByUserID: this.current_user_id(),
        isLocked: false,
      };

      this.apppointmentService.create(payload).subscribe({
        next: () => this.handleSuccess('تم حجز الموعد بنجاح'),
        error: (err) => this.handleError(err),
      });
    }
  }

  private handleSuccess(msg: string) {
    this.notify.showMessage({ message: msg, status: 'success' });
    this.schadualed.set(true);
    this.isSubmitting.set(false);
    setTimeout(() => this.closed.emit(true), 1500);
  }

  private handleError(err: any) {
    this.notify.showMessage({
      message: 'فشل: ' + (err.message || 'خطأ غير متوقع'),
      status: 'failed',
    });
    this.isSubmitting.set(false);
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
