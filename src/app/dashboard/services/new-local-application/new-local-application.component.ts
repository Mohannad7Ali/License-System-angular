import { Component, OnInit, inject, signal, Input } from '@angular/core'; // ✅ أضفنا Input هنا
import { CommonModule, Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';
import { Router, RouterLink, CanDeactivateFn } from '@angular/router';
import { switchMap, catchError, throwError, of } from 'rxjs';

import { LicenseClassService } from '../../../services/license-class.service';
import { PersonService } from '../../../services/person.service';
import { ApplicationService } from '../../../services/application.service';
import { LocalApplicationService } from '../../../services/local-application.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { NotificationService } from '../../../services/notification.service';

import { Person } from '../../../models/person.model';
import { LicenseClass } from '../../../models/license-class.model';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { NotificationComponent } from '../../../shared/notification/notification.component';

@Component({
  selector: 'app-new-local-application',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmationDialogComponent,
    NotificationComponent,
    RouterLink,
  ],
  templateUrl: './new-local-application.component.html',
  styleUrl: './new-local-application.component.css',
})
export class NewLocalApplicationComponent implements OnInit {
  // ✅ أضفنا هذه الأسطر لحل مشكلة التوافق مع المكون الأب
  @Input() application_id: number | null = null;
  @Input() person_id: number | null = null;

  private fb = inject(FormBuilder);
  private personService = inject(PersonService);
  private applicationService = inject(ApplicationService);
  private localAppService = inject(LocalApplicationService);
  private licenseClassService = inject(LicenseClassService);
  private currentUserService = inject(CurrentUserService);
  private notify = inject(NotificationService);
  private location = inject(Location);

  // إدارة التبويبات
  activeTab = signal<'existing' | 'new'>('existing');

  // البيانات
  licenseClasses: LicenseClass[] = [];
  isSubmitting = signal(false);
  isDialogVisible = signal(false);

  // تبويب شخص موجود
  existingSearchControl = new FormControl('', [Validators.required]);
  foundPerson = signal<Person | null>(null);
  isSearching = signal(false);

  // تبويب شخص جديد
  newPersonForm!: FormGroup;
  licenseClassControl = new FormControl('', [Validators.required]);

  ngOnInit(): void {
    this.loadInitialData();
    this.initNewPersonForm();
  }

  loadInitialData() {
    this.licenseClassService
      .getAllClasses()
      .subscribe((res) => (this.licenseClasses = res));
  }

  initNewPersonForm() {
    this.newPersonForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      nationalNo: ['', Validators.required],
      phone: ['', Validators.required],
      gender: ['F', Validators.required],
      birthDate: ['', Validators.required],
      address: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
    });
  }

  setTab(tab: 'existing' | 'new') {
    this.activeTab.set(tab);
    this.foundPerson.set(null);
    this.existingSearchControl.reset();
    this.newPersonForm.reset({ gender: 'F' });
  }

  onSearch() {
    const no = this.existingSearchControl.value?.trim();
    if (!no) return;

    this.isSearching.set(true);
    this.personService.all().subscribe({
      next: (people) => {
        const p = people.find((x) => x.nationalNumber === no);
        if (p) {
          this.foundPerson.set(p);
          this.notify.showMessage({
            message: 'تم العثور على الشخص بنجاح',
            status: 'success',
          });
        } else {
          this.foundPerson.set(null);
          this.notify.showMessage({
            message: 'الرقم الوطني غير موجود',
            status: 'failed',
          });
        }
        this.isSearching.set(false);
      },
      error: () => {
        this.isSearching.set(false);
        this.notify.showMessage({
          message: 'خطأ في الاتصال بالسيرفر',
          status: 'failed',
        });
      },
    });
  }

  onSubmit() {
    if (this.activeTab() === 'existing' && !this.foundPerson()) {
      this.notify.showMessage({
        message: 'يرجى اختيار شخص أولاً',
        status: 'failed',
      });
      return;
    }
    if (this.activeTab() === 'new' && this.newPersonForm.invalid) {
      this.newPersonForm.markAllAsTouched();
      return;
    }
    if (this.licenseClassControl.invalid) {
      this.notify.showMessage({
        message: 'يرجى اختيار فئة الرخصة',
        status: 'failed',
      });
      return;
    }
    this.isDialogVisible.set(true);
  }

  onDialogResult(confirmed: boolean) {
    this.isDialogVisible.set(false);
    if (confirmed) this.processOrder();
  }

  processOrder() {
    this.isSubmitting.set(true);
    const currentUser = this.currentUserService.getCurrentUser();

    const person$ =
      this.activeTab() === 'existing'
        ? of(this.foundPerson()!)
        : this.personService.create({
            id: 0,
            firstName: this.newPersonForm.value.firstName,
            secondName: '.',
            thirdName: '.',
            lastName: this.newPersonForm.value.lastName,
            nationalNumber: this.newPersonForm.value.nationalNo,
            email: this.newPersonForm.value.email,
            phoneNumber: this.newPersonForm.value.phone,
            gender: this.newPersonForm.value.gender,
            birthDate: this.newPersonForm.value.birthDate,
            nationality: '1',
            address: this.newPersonForm.value.address,
            personalPicture: '',
            createdByUserID: currentUser?.id || 1,
            creationDate: new Date().toISOString(),
          } as any);

    person$
      .pipe(
        switchMap((person) => {
          const appData: any = {
            id: 0,
            personID: person.id,
            applicationTypeID: 1,
            status: 1,
            paidFees: 15,
            createdByUserID: currentUser?.id || 1,
            date: new Date().toISOString(),
            lastStatusDate: new Date().toISOString(),
          };
          return this.applicationService.create(appData);
        }),
        switchMap((app) => {
          const localAppData = {
            id: 0,
            applicationID: app.id,
            licenseClassID: Number(this.licenseClassControl.value),
          };
          return this.localAppService.create(localAppData);
        }),
        catchError((err) => {
          this.isSubmitting.set(false);
          this.notify.showMessage({
            message: 'فشل التقديم: ' + (err.error?.message || 'خطأ'),
            status: 'failed',
          });
          return throwError(() => err);
        }),
      )
      .subscribe(() => {
        this.notify.showMessage({
          message: 'تم تقديم طلب الرخصة بنجاح!',
          status: 'success',
        });
        this.location.back();
      });
  }

  onCancel() {
    this.location.back();
  }
}

export const canDeactivate: CanDeactivateFn<NewLocalApplicationComponent> = (
  comp,
) => {
  if (
    (comp.newPersonForm.dirty || comp.licenseClassControl.dirty) &&
    !comp.isSubmitting()
  ) {
    return window.confirm('هل تريد المغادرة؟ لم يتم حفظ البيانات.');
  }
  return true;
};
