import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InternationlLicenseService } from '../../../../services/international-license.service';
import { DriverService } from '../../../../services/driver.service';
import { PersonService } from '../../../../services/person.service';
import { DialogWrapperComponent } from '../../../../shared/dialog-wrapper/dialog-wrapper.component';
import { NotificationService } from '../../../../services/notification.service';
import { switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-preview-license-int',
  standalone: true,
  imports: [CommonModule, DatePipe, DialogWrapperComponent, RouterLink],
  templateUrl: './preview-license.component.html',
  styleUrl: './preview-license.component.css',
})
export class PreviewLicenseComponent implements OnInit {
  license = signal<any>(null);
  person = signal<any>(null);
  loading = signal(true); // التحكم في شاشة التحميل

  private route = inject(ActivatedRoute);
  private intLicenseServ = inject(InternationlLicenseService);
  private driverService = inject(DriverService);
  private personService = inject(PersonService);
  private location = inject(Location);
  private destroyRef = inject(DestroyRef);
  private notify = inject(NotificationService);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      const id = params['id'];
      if (id) {
        this.loadData(Number(id));
      }
    });
  }

  loadData(id: number) {
    this.loading.set(true); // تشغيل التحميل
    const sub = this.intLicenseServ
      .read(id)
      .pipe(
        tap((res) => this.license.set(res)),
        switchMap((res) => this.driverService.getDriverById(res.driverID)),
        switchMap((driver) => this.personService.read(driver.personID)),
      )
      .subscribe({
        next: (personData) => {
          this.person.set(personData);
          setTimeout(() => this.loading.set(false), 800); // إغلاق التحميل بعد ثانية بسيطة لإعطاء شعور بالاحترافية
        },
        error: () => {
          this.notify.showMessage({
            message: 'خطأ في تحميل بيانات الرخصة',
            status: 'failed',
          });
          this.loading.set(false);
        },
      });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  getGenderText(): string {
    const g = this.person()?.gender;
    if (!g) return 'غير محدد';
    return g === 'M' || g === 'Male' ? 'ذكر' : 'أنثى';
  }

  // ✅ تفعيل الطباعة
  onPrint() {
    window.print();
  }

  onBack() {
    this.location.back();
  }
}
