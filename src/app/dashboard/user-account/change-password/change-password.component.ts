import { Component, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UserService } from '../../../services/user.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { NotificationService } from '../../../services/notification.service';

import { DialogWrapperComponent } from '../../../shared/dialog-wrapper/dialog-wrapper.component';
import { NotificationComponent } from '../../../shared/notification/notification.component';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DialogWrapperComponent,
    NotificationComponent,
  ],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private userService = inject(UserService);
  private currentUserService = inject(CurrentUserService);
  private notify = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  passwordForm: FormGroup;
  isSubmitting = signal(false);

  // Signals للتحكم بإظهار/إخفاء كلمات المرور
  showOldPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  constructor() {
    this.passwordForm = this.fb.group(
      {
        oldPassword: ['', [Validators.required]],
        newPassword: ['', [Validators.required, Validators.minLength(5)]],
        confirmPassword: ['', [Validators.required]],
      },
      {
        validators: this.passwordMatchValidator,
      },
    );
  }

  // Validator للتأكد من تطابق كلمتي المرور
  passwordMatchValidator(g: FormGroup) {
    const newPwd = g.get('newPassword')?.value;
    const confirmPwd = g.get('confirmPassword')?.value;
    return newPwd === confirmPwd ? null : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const user = this.currentUserService.getCurrentUser() as any;
    if (!user) {
      this.notify.showMessage({
        message: 'عذراً، لم يتم العثور على بيانات الحساب الحالي!',
        status: 'failed',
      });
      return;
    }

    const currentPwd = user.password ?? user.Password;

    // التحقق من كلمة المرور القديمة
    if (this.passwordForm.value.oldPassword !== currentPwd) {
      this.notify.showMessage({
        message: 'كلمة المرور الحالية غير صحيحة!',
        status: 'failed',
      });
      return;
    }

    this.isSubmitting.set(true);

    const userId = Number(user.id ?? user.userID ?? user.userId);

    // بناء كائن المستخدم المحدث مع الحفاظ على كافة الحقول
    const updatedUser = {
      ...user,
      password: this.passwordForm.value.newPassword,
      Password: this.passwordForm.value.newPassword,
    };

    this.userService
      .update(userId, updatedUser)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.notify.showMessage({
            message: 'تم تغيير كلمة المرور بنجاح',
            status: 'success',
          });

          // تحديث بيانات المستخدم في التخزين المحلي
          window.localStorage.setItem(
            'current-user',
            JSON.stringify(updatedUser),
          );

          setTimeout(() => this.onCancel(), 1500);
        },
        error: (err) => {
          this.notify.showMessage({
            message:
              'فشل التحديث: ' +
              (err.error?.message || err.message || 'حدث خطأ غير متوقع'),
            status: 'failed',
          });
          this.isSubmitting.set(false);
        },
      });
  }

  onCancel() {
    this.location.back();
  }
}
