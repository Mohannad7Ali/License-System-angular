import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  Subject,
  takeUntil,
  tap,
  forkJoin,
  catchError,
  throwError,
} from 'rxjs';

import { AppointmentService } from '../../../services/appointment.service';
import { TestService } from '../../../services/test.service';
import { TestTypesService } from '../../../services/test-type.service';
import { NotificationService } from '../../../services/notification.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { Test } from '../../../models/test.model';
import { Appointment_View } from '../../../models/appointment.model';
import { TestType } from '../../../models/test-type.model';

import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { NotificationComponent } from '../../../shared/notification/notification.component';
import { DialogWrapperComponent } from '../../../shared/dialog-wrapper/dialog-wrapper.component';

@Component({
  selector: 'app-take-test',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    ConfirmationDialogComponent,
    NotificationComponent,
    DialogWrapperComponent,
  ],
  templateUrl: './take-test.component.html',
  styleUrl: './take-test.component.css',
})
export class TakeTestComponent implements OnInit, OnDestroy {
  // State
  id: number | null = null;
  appointment = signal<Appointment_View | null>(null);
  testTypes = signal<TestType[]>([]);
  isDialogVisible = signal<boolean>(false);
  isSubmitting = signal<boolean>(false);
  test: Test | null = null;

  // Form
  testForm!: FormGroup;

  private destroy$ = new Subject<void>();
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private appointmentService = inject(AppointmentService);
  private testService = inject(TestService);
  private testTypeService = inject(TestTypesService);
  private notificationService = inject(NotificationService);
  private currentUserService = inject(CurrentUserService);
  private location = inject(Location);

  ngOnInit(): void {
    this.initForm();

    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.id = +params['id'];
        if (this.id) this.loadData();
      });
  }

  private initForm() {
    this.testForm = this.fb.group({
      result: ['1', [Validators.required]], // '1' for Pass, '0' for Fail
      notes: ['', [Validators.maxLength(500)]],
    });
  }

  private loadData() {
    forkJoin({
      types: this.testTypeService.all(),
      appInfo: this.appointmentService.readView(this.id!),
    })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res) => {
          this.testTypes.set(res.types);

          // معالجة الاسم إذا كان قادماً كـ JSON String
          let rawName = res.appInfo.fullName;
          try {
            const parsed = JSON.parse(rawName);
            res.appInfo.fullName = parsed.fullName || rawName;
          } catch (e) {}

          this.appointment.set(res.appInfo);
        },
        error: (err) =>
          this.notificationService.showMessage({
            message: 'فشل في تحميل بيانات الموعد',
            status: 'failed',
          }),
      });
  }

  onSubmit() {
    if (this.testForm.invalid) return;
    this.isDialogVisible.set(true);
  }

  onDialogResult(confirmed: boolean) {
    this.isDialogVisible.set(false);
    if (confirmed) {
      this.saveTestResult();
    }
  }

  private saveTestResult() {
    this.isSubmitting.set(true);
    const formValues = this.testForm.value;
    const currentUser = this.currentUserService.getCurrentUser();

    const testData: Test = {
      appointmentID: this.id!,
      result: formValues.result === '1',
      notes: formValues.notes || 'لا توجد ملاحظات',
      createdByUserID: currentUser?.id || 1,
    };

    this.testService.create(testData).subscribe({
      next: (response) => {
        this.test = response;
        this.notificationService.showMessage({
          message: 'تم حفظ نتيجة الاختبار بنجاح وتم إغلاق الموعد.',
          status: 'success',
        });
        setTimeout(() => this.location.back(), 1500);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.notificationService.showMessage({
          message:
            'فشل حفظ النتيجة: ' + (err.error?.message || 'خطأ في الخادم'),
          status: 'failed',
        });
      },
    });
  }

  onCancel() {
    this.location.back();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
