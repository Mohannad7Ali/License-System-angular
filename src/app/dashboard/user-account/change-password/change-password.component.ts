import { Component, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../services/user.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { NotificationService } from '../../../services/notification.service';
import { DialogWrapperComponent } from '../../../shared/dialog-wrapper/dialog-wrapper.component';

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DialogWrapperComponent],
  templateUrl: './change-password.component.html',
  styleUrl: './change-password.component.css',
})
export class ChangePasswordComponent {
  private fb = inject(FormBuilder);
  private location = inject(Location);
  private userService = inject(UserService);
  private currentUserService = inject(CurrentUserService);
  private notify = inject(NotificationService);

  passwordForm: FormGroup;
  isSubmitting = signal(false);

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

  // مخصص للتأكد من تطابق كلمة المرور الجديدة مع التأكيد
  passwordMatchValidator(g: FormGroup) {
    return g.get('newPassword')?.value === g.get('confirmPassword')?.value
      ? null
      : { mismatch: true };
  }

  onSubmit() {
    if (this.passwordForm.invalid) return;

    const user = this.currentUserService.getCurrentUser();
    if (!user) return;

    // التحقق من كلمة المرور القديمة (منطق محلي قبل الإرسال)
    if (this.passwordForm.value.oldPassword !== user.password) {
      this.notify.showMessage({
        message: 'كلمة المرور القديمة غير صحيحة!',
        status: 'failed',
      });
      return;
    }

    this.isSubmitting.set(true);

    // بناء كائن المستخدم المحدث (حسب Swagger Schema)
    const updatedUser = {
      ...user,
      password: this.passwordForm.value.newPassword,
    };

    this.userService.update(user.id, updatedUser).subscribe({
      next: () => {
        this.notify.showMessage({
          message: 'تم تغيير كلمة المرور بنجاح',
          status: 'success',
        });
        // تحديث بيانات المستخدم في الكاش المحلي
        window.localStorage.setItem(
          'current-user',
          JSON.stringify(updatedUser),
        );
        setTimeout(() => this.onCancel(), 1500);
      },
      error: (err) => {
        this.notify.showMessage({
          message: 'فشل التحديث: ' + err.message,
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
