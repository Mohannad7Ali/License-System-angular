import {
  Component,
  OnInit,
  inject,
  signal,
  Input,
  OnChanges,
  SimpleChanges,
  DestroyRef,
  PLATFORM_ID,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, CanDeactivateFn } from '@angular/router';
import { forkJoin, switchMap, catchError, throwError, tap } from 'rxjs';

import { CountryService } from '../../../services/country.service';
import { LicenseClassService } from '../../../services/license-class.service';
import { PersonService } from '../../../services/person.service';
import { ApplicationService } from '../../../services/application.service';
import { LocalApplicationService } from '../../../services/local-application.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { NotificationService } from '../../../services/notification.service';

import { Person } from '../../../models/person.model';
import { LicenseClass } from '../../../models/license-class.model';
import { Country } from '../../../models/country.model';
import { isExist } from '../../custom-validator';
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
  ],
  templateUrl: './new-local-application.component.html',
  styleUrl: './new-local-application.component.css',
})
export class NewLocalApplicationComponent implements OnInit, OnChanges {
  @Input() application_id: number | null = null;
  @Input() person_id: number | null = null;

  mode: 'add' | 'edit' = 'add';
  countries: Country[] = [];
  licenseClasses: LicenseClass[] = [];
  isDialogVisible = signal(false);
  isSubmitting = signal(false);

  testImageUrl = 'https://cdn-icons-png.flaticon.com/256/5844/5844412.png';
  imagePreview = signal<string>(this.testImageUrl);

  registerForm!: FormGroup;

  private fb = inject(FormBuilder);
  private countryService = inject(CountryService);
  private licenseClassService = inject(LicenseClassService);
  private personService = inject(PersonService);
  private applicationService = inject(ApplicationService);
  private localAppService = inject(LocalApplicationService);
  private currentUserService = inject(CurrentUserService);
  private notify = inject(NotificationService);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.initForm();
    this.loadInitialData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.application_id || this.person_id) {
      this.mode = 'edit';
      this.registerForm.get('nationalNo')?.clearAsyncValidators();
    }
  }

  private initForm() {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      secondName: ['', [Validators.required, Validators.maxLength(50)]],
      thirdName: ['', [Validators.maxLength(50)]], // جعلناه اختيارياً
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      nationalNo: [
        '',
        {
          validators: [
            Validators.required,
            Validators.pattern('^[0-9]{5,20}$'),
          ],
          asyncValidators: [
            this.mode === 'add' ? isExist(this.personService) : [],
          ],
          // ❌ حذفنا updateOn: 'blur' ليعمل الزر فوراً عند الكتابة
        },
      ],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]],
      gender: ['M', Validators.required],
      birthDate: ['', Validators.required],
      country: ['', Validators.required],
      address: ['', [Validators.required]],
      licenseClass: ['', Validators.required],
      personalPicture: [this.testImageUrl, Validators.required],
    });
  }

  private loadInitialData() {
    this.countryService
      .AllCountries()
      .subscribe((res) => (this.countries = res));
    this.licenseClassService
      .getAllClasses()
      .subscribe((res) => (this.licenseClasses = res));
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // إرسال مسار وهمي للسيرفر لتجنب الـ Base64 الثقيل
      const fakePath = `C:\\DVLD_Photos\\${file.name}`;
      this.registerForm.patchValue({ personalPicture: fakePath });

      const reader = new FileReader();
      reader.onload = () => this.imagePreview.set(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.registerForm.invalid) {
      // الكود التالي يطبع لك في الـ Console أي حقل هو المسبب في جعل الزر معطلاً
      Object.keys(this.registerForm.controls).forEach((key) => {
        const controlErrors = this.registerForm.get(key)?.errors;
        if (controlErrors)
          console.log('Field: ' + key + ' is invalid', controlErrors);
      });
      this.registerForm.markAllAsTouched();
      return;
    }
    this.isDialogVisible.set(true);
  }

  onDialogResult(confirmed: boolean) {
    this.isDialogVisible.set(false);
    if (confirmed) this.processApplication();
  }

  private processApplication() {
    this.isSubmitting.set(true);
    const form = this.registerForm.value;
    const currentUser = this.currentUserService.getCurrentUser();

    const personData: Person = {
      id: 0,
      firstName: form.firstName,
      secondName: form.secondName,
      thirdName: form.thirdName || '',
      lastName: form.lastName,
      nationalNumber: form.nationalNo,
      email: form.email,
      phoneNumber: form.phone,
      gender: form.gender,
      birthDate: form.birthDate,
      nationality: String(form.country),
      address: form.address,
      personalPicture: form.personalPicture || this.testImageUrl,
      createdByUserID: currentUser?.id || 1,
      creationDate: new Date().toISOString(),
      updatedByUserID: null,
      updatedDate: null,
    };

    this.personService
      .create(personData)
      .pipe(
        switchMap((newPerson) => {
          const appData: any = {
            id: 0,
            personID: newPerson.id,
            applicationTypeID: 1,
            status: 1,
            date: new Date().toISOString(),
            paidFees: 15,
            lastStatusDate: new Date().toISOString(),
            createdByUserID: currentUser?.id || 1,
          };
          return this.applicationService.create(appData);
        }),
        switchMap((newApp) => {
          const localAppData = {
            id: 0,
            applicationID: newApp.id,
            licenseClassID: Number(form.licenseClass),
          };
          return this.localAppService.create(localAppData);
        }),
        catchError((err) => {
          this.isSubmitting.set(false);
          this.notify.showMessage({
            message: 'فشل: ' + (err.error?.message || 'خطأ غير معروف'),
            status: 'failed',
          });
          return throwError(() => err);
        }),
      )
      .subscribe(() => {
        this.notify.showMessage({
          message: 'تم التقديم بنجاح!',
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
  if (comp.registerForm.dirty && !comp.isSubmitting()) {
    return window.confirm('هل تريد المغادرة؟ لم يتم حفظ البيانات.');
  }
  return true;
};
