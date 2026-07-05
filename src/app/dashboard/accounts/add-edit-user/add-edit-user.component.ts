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
    this.userForm.patchValue({ personID: null }); // إعادة تهيئة المعرف لحين العثور على الشخص

    // هنا يفضل جلب كائن الشخص كاملاً مباشرة
    this.personService.isNationalNoExist(nationalNo).subscribe({
      next: (exists) => {
        if (exists) {
          // استبدل read بـ الدالة المناسبة لديك لجلب الشخص عبر الرقم الوطني
          // أو مرر كائن تجريبي مؤقتاً للتأكد من عمل الواجهة
          this.personService.read(1).subscribe((person) => {
            this.foundPerson.set(person);

            // تحديث قيمة الـ personID داخل الفورم لجعله Valid وتفعيل الزر
            this.userForm.patchValue({ personID: person.id });

            this.notify.showMessage({
              message: 'تم العثور على الشخص بنجاح',
              status: 'success',
            });
            this.isSearching.set(false);
          });
        } else {
          this.searchedAndNotFound.set(true);
          this.notify.showMessage({
            message: 'هذا الرقم الوطني غير مسجل كـ "شخص"',
            status: 'failed',
          });
          this.isSearching.set(false);
        }
      },
      error: () => {
        this.isSearching.set(false);
        this.notify.showMessage({
          message: 'حدث خطأ أثناء البحث',
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
