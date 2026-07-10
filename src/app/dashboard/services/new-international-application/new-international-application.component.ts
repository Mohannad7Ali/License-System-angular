import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { LicenseService } from '../../../services/license.service';
import { InternationlLicenseService } from '../../../services/international-license.service';
import { NotificationService } from '../../../services/notification.service';
import { CurrentUserService } from '../../../services/current-user.service';
import { PersonService } from '../../../services/person.service';
import { DriverService } from '../../../services/driver.service';
import { InternationalLicense } from '../../../models/internationl-license.model';

@Component({
  selector: 'app-new-international-application',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, DatePipe],
  templateUrl: './new-international-application.component.html',
  styleUrl: './new-international-application.component.css',
})
export class NewInternationalApplicationComponent implements OnInit {
  // الخدمات
  private licenseService = inject(LicenseService);
  private intLicenseService = inject(InternationlLicenseService);
  private personService = inject(PersonService);
  private driverService = inject(DriverService);
  private notify = inject(NotificationService);
  private userService = inject(CurrentUserService);
  private location = inject(Location);

  // الحالات (Signals)
  licenseSearch = new FormControl<number | null>(null, [
    Validators.required,
    Validators.min(1),
  ]);
  isSubmitting = signal(false);
  isSearching = signal(false);
  foundLocalLicense = signal<any>(null);
  applicantName = signal<string>('');
  currentEmployeeName = signal<string>('Admin');

  // تواريخ
  today = new Date();
  expiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1));

  ngOnInit(): void {
    // جلب اسم الموظف الحالي من الخدمة
    const user = this.userService.getCurrentUser();
    if (user && user.username) {
      this.currentEmployeeName.set(user.username);
    }
  }

  onSearch() {
    if (this.licenseSearch.invalid) return;

    this.isSearching.set(true);
    this.applicantName.set('جاري التحقق...');
    this.foundLocalLicense.set(null);

    this.licenseService.read(this.licenseSearch.value!).subscribe({
      next: (license) => {
        // 1. التحقق من أن الرخصة نشطة
        if (!license.isActive) {
          this.notify.showMessage({
            message: 'عذراً، هذه الرخصة غير نشطة',
            status: 'failed',
          });
          this.resetSearch();
          return;
        }

        // 2. التحقق من أن الرخصة غير منتهية الصلاحية (شرط أساسي دولياً)
        const localExpDate = new Date(license.expDate);
        if (localExpDate < new Date()) {
          this.notify.showMessage({
            message: 'عذراً، الرخصة المحلية منتهية الصلاحية ولا يمكن استخدامها',
            status: 'failed',
          });
          this.resetSearch();
          return;
        }

        this.foundLocalLicense.set(license);
        // 3. جلب بيانات السائق والاسم
        this.loadDriverAndPersonName(license.driverID);
      },
      error: () => {
        this.notify.showMessage({
          message: 'رقم الرخصة المحلية غير موجود في السجلات',
          status: 'failed',
        });
        this.resetSearch();
      },
    });
  }

  loadDriverAndPersonName(driverId: number) {
    this.driverService.read(driverId).subscribe({
      next: (driver: any) => {
        const personId = driver.personID;
        this.personService.getFullName(personId).subscribe({
          next: (res: any) => {
            let name = '';
            // معالجة ذكية لاستخراج الاسم سواء عاد كـ String أو JSON String أو Object
            if (typeof res === 'string') {
              if (res.startsWith('{')) {
                try {
                  const parsed = JSON.parse(res);
                  name = parsed.fullName || res;
                } catch {
                  name = res;
                }
              } else {
                name = res;
              }
            } else if (res && res.fullName) {
              name = res.fullName;
            }
            this.applicantName.set(name || 'اسم غير معروف');
            this.isSearching.set(false);
          },
          error: () => this.handleErrorState('فشل جلب اسم الشخص'),
        });
      },
      error: () => this.handleErrorState('فشل جلب بيانات السائق'),
    });
  }

  private handleErrorState(msg: string) {
    this.applicantName.set('غير معروف');
    this.isSearching.set(false);
    this.notify.showMessage({ message: msg, status: 'failed' });
  }

  resetSearch() {
    this.foundLocalLicense.set(null);
    this.applicantName.set('');
    this.isSearching.set(false);
  }

  onIssue() {
    if (!this.foundLocalLicense() || this.isSubmitting()) return;

    this.isSubmitting.set(true);
    const currentUser = this.userService.getCurrentUser();

    // بناء الكائن مع التأكد من أن المعرفات أرقام (Numbers) وليست نصوصاً
    const payload: InternationalLicense = {
      internationalLicenseID: 0,
      applicationID: 0,
      driverID: Number(this.foundLocalLicense().driverID),
      issuedUsingLocalLicenseID: Number(this.foundLocalLicense().id),
      issueDate: new Date().toISOString(),
      expirationDate: this.expiryDate.toISOString(),
      isActive: true,
      createdByUserID: currentUser?.id || 1,
    };

    this.intLicenseService.create(payload).subscribe({
      next: (res: any) => {
        this.notify.showMessage({
          message: `تم إصدار الرخصة الدولية بنجاح! رقم الرخصة: ${res.internationalLicenseID}`,
          status: 'success',
        });
        setTimeout(() => this.location.back(), 2000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        // استخراج رسالة الخطأ الحقيقية من السيرفر إذا كانت موجودة
        const errorMsg =
          err.error?.message ||
          err.error ||
          'خطأ في قواعد البيانات (ربما السائق يمتلك رخصة دولية نشطة بالفعل)';
        this.notify.showMessage({
          message: 'فشل الإصدار: ' + errorMsg,
          status: 'failed',
        });
      },
    });
  }

  onCancel() {
    this.location.back();
  }
}
