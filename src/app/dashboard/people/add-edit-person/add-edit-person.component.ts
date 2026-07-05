import { Component, OnInit, inject, signal } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { PersonService } from '../../../services/person.service';
import { CountryService } from '../../../services/country.service';
import { NotificationService } from '../../../services/notification.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { Person } from '../../../models/person.model';
import { isExist } from '../../custom-validator';

@Component({
  selector: 'app-add-edit-person',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-edit-person.component.html',
  styleUrls: ['./add-edit-person.component.css'],
})
export class AddEditPersonComponent implements OnInit {
  personForm!: FormGroup;
  mode: 'add' | 'edit' = 'add';
  personId: number | null = null;
  serverErrors: string[] = [];
  countries: any[] = [];

  imagePreview = signal<string | null>(
    'https://cdn-icons-png.flaticon.com/256/5844/5844412.png',
  );

  private fb = inject(FormBuilder);
  private personService = inject(PersonService);
  private countryService = inject(CountryService);
  private notify = inject(NotificationService);
  private currentUserService = inject(CurrentUserService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  ngOnInit(): void {
    // 1. جلب الـ ID وتحديد الـ mode أولاً وقبل أي شيء
    const idParam = this.route.snapshot.params['id'];
    if (idParam) {
      this.mode = 'edit';
      this.personId = Number(idParam);
    }

    // 2. بناء الفورم الآن بعد أن أصبحت قيمة this.mode صحيحة ودقيقة
    this.initForm();
    this.loadCountries();

    // 3. جلب البيانات وتعبئتها في حال كنا في وضع التعديل
    if (this.mode === 'edit' && this.personId) {
      this.loadPersonData(this.personId);
    }
  }

  private initForm(): void {
    this.personForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(50)]],
      secondName: ['', [Validators.required, Validators.maxLength(50)]],
      thirdName: ['', [Validators.required, Validators.maxLength(50)]],
      lastName: ['', [Validators.required, Validators.maxLength(50)]],
      nationalNumber: [
        '',
        {
          validators: [Validators.required, Validators.maxLength(20)],
          // الآن سيعمل الشرط بشكل سليم تماماً ولن يضيف الـ validator في وضع التعديل
          asyncValidators: [
            this.mode === 'add' ? isExist(this.personService) : [],
          ],
          updateOn: 'blur',
        },
      ],
      address: ['', [Validators.required, Validators.maxLength(150)]],
      email: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required]],
      birthDate: ['', [Validators.required]],
      personalPicture: [''],
      nationality: ['', [Validators.required]],
      gender: ['M', [Validators.required]],
    });
  }

  loadCountries() {
    this.countryService
      .AllCountries()
      .subscribe((data) => (this.countries = data));
  }

  private loadPersonData(id: number): void {
    this.personService.read(id).subscribe({
      next: (person) => {
        if (person.birthDate) person.birthDate = person.birthDate.split('T')[0];
        if (person.nationality) person.nationality = String(person.nationality);

        this.personForm.patchValue(person);

        if (person.personalPicture) {
          this.imagePreview.set(person.personalPicture);
        }
      },
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        this.imagePreview.set(base64String);

        const virtualUrl = `https://cdn-icons-png.flaticon.com/256/5844/5844412.png?file=${Date.now()}_${file.name}`;
        this.personForm.patchValue({ personalPicture: virtualUrl });
      };
      reader.readAsDataURL(file);
    }
  }

  onSave() {
    this.serverErrors = [];
    if (this.personForm.invalid) {
      this.personForm.markAllAsTouched();
      return;
    }

    const currentUser = this.currentUserService.getCurrentUser();
    const formValues = this.personForm.value;

    const finalId =
      this.mode === 'add'
        ? Math.floor(Math.random() * 900000) + 100000
        : (this.personId ?? 0);

    const finalPicturePath =
      formValues.personalPicture ||
      'https://cdn-icons-png.flaticon.com/256/5844/5844412.png';

    const personData: Person = {
      id: finalId,
      firstName: formValues.firstName,
      secondName: formValues.secondName,
      thirdName: formValues.thirdName,
      lastName: formValues.lastName,
      nationalNumber: formValues.nationalNumber,
      address: formValues.address,
      email: formValues.email,
      phoneNumber: formValues.phoneNumber,
      birthDate: formValues.birthDate,
      personalPicture: finalPicturePath,
      nationality: String(formValues.nationality),
      gender: formValues.gender,
      createdByUserID: this.mode === 'add' ? 0 : currentUser?.id || 1,
      creationDate:
        this.mode === 'add' ? '0001-01-01T00:00:00' : new Date().toISOString(),
      updatedByUserID: 1,
      updatedDate: new Date().toISOString(),
    };

    const request =
      this.mode === 'add'
        ? this.personService.create(personData)
        : this.personService.update(personData.id, personData);

    request.subscribe({
      next: () => {
        this.notify.showMessage({
          message:
            this.mode === 'add'
              ? 'تم إضافة البيانات بنجاح'
              : 'تم تحديث البيانات بنجاح',
          status: 'success',
        });
        this.router.navigate(['/dashboard/people']);
      },
      error: (err) => this.handleError(err),
    });
  }

  private handleError(err: any) {
    if (err.error && err.error.errors) {
      this.serverErrors = Object.values(err.error.errors).flat() as string[];
    } else {
      this.serverErrors = [
        err.error?.message ||
          'خطأ في التحقق من البيانات (تأكد من الرقم الوطني والعمر)',
      ];
    }
    this.notify.showMessage({ message: 'فشل الحفظ', status: 'failed' });
    window.scrollTo(0, 0);
  }
}
