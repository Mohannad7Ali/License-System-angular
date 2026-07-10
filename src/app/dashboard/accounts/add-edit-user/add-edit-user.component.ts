import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { PersonService } from '../../../services/person.service';
import { NotificationService } from '../../../services/notification.service';
import { Person } from '../../../models/person.model';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormControl,
} from '@angular/forms';

@Component({
  selector: 'app-add-edit-user',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-edit-user.component.html',
  styleUrls: ['./add-edit-user.component.css'],
})
export class AddEditUserComponent implements OnInit {
  userForm!: FormGroup;
  searchControl = new FormControl('');

  // إدارة حالة الواجهة عبر الـ Signals لضمان توافقها مع الـ HTML
  foundPerson = signal<Person | null>(null);
  isSearching = signal<boolean>(false);
  searchedAndNotFound = signal<boolean>(false);

  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private personService = inject(PersonService);
  private notify = inject(NotificationService);
  private router = inject(Router);

  ngOnInit(): void {
    this.userForm = this.fb.group(
      {
        personID: [null, Validators.required], // هذا الحقل يتطلب قيمة لتفعيل زر الحفظ
        username: ['', [Validators.required, Validators.minLength(3)]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', Validators.required],
        isActive: [true],
      },
      { validators: this.passwordMatchValidator },
    );
  }

  onSearchPerson() {
    const nationalNo = this.searchControl.value?.trim();
    if (!nationalNo) return;

    this.isSearching.set(true);
    this.searchedAndNotFound.set(false);
    this.foundPerson.set(null);
    this.userForm.patchValue({ personID: null });

    // 1. جلب قائمة كل الأشخاص من السيرفر
    this.personService.all().subscribe({
      next: (people: Person[]) => {
        // 2. البحث داخل المصفوفة عن الشخص الذي يطابق الرقم الوطني المدخل
        const person = people.find((p) => p.nationalNumber === nationalNo);

        if (person) {
          // 3. إذا وُجد الشخص، نقوم بتحديث البيانات
          this.foundPerson.set(person);
          this.userForm.patchValue({ personID: person.id }); // هنا نضع الـ ID الحقيقي الذي وجدناه

          this.notify.showMessage({
            message: 'تم العثور على الشخص وربطه بنجاح',
            status: 'success',
          });
        } else {
          // 4. إذا لم يوجد في القائمة
          this.searchedAndNotFound.set(true);
          this.notify.showMessage({
            message: 'عذراً، هذا الرقم الوطني غير مسجل في النظام كشخص.',
            status: 'failed',
          });
        }
        this.isSearching.set(false);
      },
      error: (err) => {
        console.error('Search Error:', err);
        this.isSearching.set(false);
        this.notify.showMessage({
          message: 'حدث خطأ أثناء محاولة الاتصال بسجل الأشخاص',
          status: 'failed',
        });
      },
    });
  }

  passwordMatchValidator(g: FormGroup) {
    return g.get('password')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSave() {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const userData = {
      id: 0,
      username: this.userForm.value.username,
      password: this.userForm.value.password,
      isActive: this.userForm.value.isActive,
      personID: this.userForm.value.personID,
    };

    this.userService.create(userData).subscribe({
      next: () => {
        this.notify.showMessage({
          message: 'تم إنشاء حساب المستخدم بنجاح',
          status: 'success',
        });
        this.router.navigate(['/dashboard/accounts']);
      },
      error: (err) =>
        this.notify.showMessage({
          message: 'خطأ: ' + (err.error?.message || 'فشل حفظ الحساب'),
          status: 'failed',
        }),
    });
  }
}
