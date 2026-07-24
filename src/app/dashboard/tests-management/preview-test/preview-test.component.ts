import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, tap, catchError, of, forkJoin } from 'rxjs';

import { TestService } from '../../../services/test.service';
import { AppointmentService } from '../../../services/appointment.service';
import { TestTypesService } from '../../../services/test-type.service';
import { NotificationService } from '../../../services/notification.service';

import { Test } from '../../../models/test.model';
import { Appointment_View } from '../../../models/appointment.model';
import { TestType } from '../../../models/test-type.model';

import { NotificationComponent } from '../../../shared/notification/notification.component';
import { DialogWrapperComponent } from '../../../shared/dialog-wrapper/dialog-wrapper.component';

@Component({
  selector: 'app-preview-test',
  standalone: true,
  imports: [
    CommonModule,
    NotificationComponent,
    DialogWrapperComponent,
    DatePipe,
  ],
  templateUrl: './preview-test.component.html',
  styleUrl: './preview-test.component.css',
})
export class PreviewTestComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private testService = inject(TestService);
  private appointmentService = inject(AppointmentService);
  private testTypeService = inject(TestTypesService);
  private notify = inject(NotificationService);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);

  testId = signal<number | null>(null);
  testData = signal<Test | null>(null);
  appointmentData = signal<Appointment_View | null>(null);
  testTypesArr = signal<TestType[]>([]);
  isLoading = signal(true);

  // 🛠️ حساب عنوان نوع الاختبار مع دعم حماية كافية لأسماء الخصائص وأنواع البيانات
  testTypeTitle = computed(() => {
    const app = this.appointmentData() as any;
    const types = this.testTypesArr() as any[];

    if (!app || !types || types.length === 0) return '---';

    // التأكد من جلب الرقم بوضوح سواء كان الحقل testType أو testTypeID
    const targetTypeId = Number(
      app.testType ?? app.testTypeID ?? app.testTypeId,
    );

    if (isNaN(targetTypeId)) return 'غير معروف';

    const foundType = types.find((t) => {
      const typeId = Number(t.id ?? t.testTypeID ?? t.testTypeId);
      return typeId === targetTypeId;
    });

    return foundType
      ? foundType.testTypeTitle || foundType.title || 'غير معروف'
      : 'غير معروف';
  });

  // 🛠️ حساب تاريخ الموعد من مختلف المسميات القادمة من الـ API
  appointmentDateValue = computed(() => {
    const app = this.appointmentData() as any;
    if (!app) return null;
    return (
      app.date ?? app.appointmentDate ?? app.Date ?? app.AppointmentDate ?? null
    );
  });

  ngOnInit(): void {
    this.route.queryParams
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        const id = params['id'];
        if (id) {
          this.testId.set(+id);
          this.loadAllData();
        }
      });
  }

  loadAllData() {
    this.isLoading.set(true);

    this.testService
      .read(this.testId()!)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        tap((test) => this.testData.set(test)),
        switchMap((test) =>
          forkJoin({
            appointment: this.appointmentService.readView(test.appointmentID),
            types: this.testTypeService.all(),
          }),
        ),
        catchError((err) => {
          this.notify.showMessage({
            message: 'خطأ في تحميل البيانات: ' + err.message,
            status: 'failed',
          });
          this.isLoading.set(false);
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.appointmentData.set(res.appointment);
          this.testTypesArr.set(res.types);
        }
        this.isLoading.set(false);
      });
  }

  onClose() {
    this.location.back();
  }
}
