import {
  Component,
  Inject,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  signal,
  inject,
} from '@angular/core';
import { CommonModule, Location, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Subject, takeUntil } from 'rxjs';

import { LocalApplicationService } from '../../../services/local-application.service';
import { NotificationService } from '../../../services/notification.service';
import { LocalApplicationView } from '../../../models/local-application.model';
import { DialogWrapperComponent } from '../../../shared/dialog-wrapper/dialog-wrapper.component';
import { NotificationComponent } from '../../../shared/notification/notification.component';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-preview-application',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DialogWrapperComponent,
    NotificationComponent,
    ConfirmationDialogComponent,
  ],
  templateUrl: './preview-application.component.html',
  styleUrl: './preview-application.component.css',
})
export class PreviewApplicationComponent implements OnInit, OnDestroy {
  // السيغنالز (Signals)
  isDialogVisible = signal<boolean>(false);
  licese_id = signal<number | undefined>(undefined);
  current_user_id = signal<number | undefined>(undefined);
  licenseIssued = signal<boolean>(false);

  application_id: number | null = null;
  current_application: LocalApplicationView | undefined = undefined;
  private destroy$ = new Subject<void>();

  // حقن الخدمات
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private localAppServ = inject(LocalApplicationService);
  private notifyServ = inject(NotificationService);
  private platformId = inject(PLATFORM_ID);

  ngOnInit(): void {
    // جلب المعرف من الرابط
    this.route.queryParams
      .pipe(takeUntil(this.destroy$))
      .subscribe((params) => {
        this.application_id = +params['application_id'];
        if (this.application_id) {
          this.retrieveApplicationData();
          this.checkLicenseIssuance();
        }
      });

    // جلب معرف المستخدم الحالي من الـ LocalStorage
    if (isPlatformBrowser(this.platformId)) {
      const userData = window.localStorage.getItem('current-user');
      if (userData) {
        const user = JSON.parse(userData);
        this.current_user_id.set(user.id);
      }
    }
  }

  retrieveApplicationData() {
    this.localAppServ.readView(this.application_id!).subscribe({
      next: (data) => (this.current_application = data),
      error: (err) =>
        this.notifyServ.showMessage({
          message: 'تعذر جلب تفاصيل الطلب',
          status: 'failed',
        }),
    });
  }

  checkLicenseIssuance() {
    this.localAppServ.licenseID(this.application_id!).subscribe({
      next: (id) => {
        if (id > 0) {
          this.licese_id.set(id);
          this.licenseIssued.set(true);
        }
      },
    });
  }

  issueLicenseFirsttime() {
    this.isDialogVisible.set(true);
  }

  onDialogResult(confirmed: boolean) {
    this.isDialogVisible.set(false);
    if (confirmed) {
      this.localAppServ
        .issueLicenseFisrTime(
          this.application_id!,
          this.current_user_id()!,
          'تم الإصدار عبر النظام',
        )
        .subscribe({
          next: (newId) => {
            this.licese_id.set(newId);
            this.licenseIssued.set(true);
            this.notifyServ.showMessage({
              message: `تم إصدار الرخصة بنجاح رقم: ${newId}`,
              status: 'success',
            });
            this.retrieveApplicationData(); // تحديث الحالة في الواجهة
          },
          error: (err) =>
            this.notifyServ.showMessage({
              message: err.message,
              status: 'failed',
            }),
        });
    }
  }

  onClose() {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
