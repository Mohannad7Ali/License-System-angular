import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LicenseService } from '../../../../../services/license.service';
import { PersonService } from '../../../../../services/person.service';
import { DriverService } from '../../../../../services/driver.service';
import { License } from '../../../../../models/license.model';
import { Person } from '../../../../../models/person.model';
import { NotificationService } from '../../../../../services/notification.service';
import { DialogWrapperComponent } from '../../../../../shared/dialog-wrapper/dialog-wrapper.component';

@Component({
  selector: 'app-preview-license',
  standalone: true,
  imports: [CommonModule, DatePipe, DialogWrapperComponent],
  templateUrl: './preview-license.component.html',
  styleUrl: './preview-license.component.css',
})
export class PreviewLicenseComponent implements OnInit {
  licenseId: number | null = null;
  license = signal<License | null>(null);
  person = signal<Person | null>(null);
  loading = signal<boolean>(true);

  private route = inject(ActivatedRoute);
  private licenseService = inject(LicenseService);
  private personService = inject(PersonService);
  private driverService = inject(DriverService);
  private notify = inject(NotificationService);
  private location = inject(Location);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.licenseId = +params['id'];
      if (this.licenseId) {
        this.loadLicenseData();
      }
    });
  }

  loadLicenseData() {
    this.licenseService.read(this.licenseId!).subscribe({
      next: (licenseData) => {
        this.license.set(licenseData);
        // بعد جلب الرخصة، نحتاج جلب بيانات السائق لمعرفة الـ PersonID
        this.loadPersonData(licenseData.driverID);
      },
      error: () => {
        this.notify.showMessage({
          message: 'تعذر العثور على بيانات الرخصة',
          status: 'failed',
        });
        this.loading.set(false);
      },
    });
  }

  loadPersonData(driverId: number) {
    this.driverService.getDriverById(driverId).subscribe({
      next: (driver) => {
        this.personService.read(driver.personID).subscribe({
          next: (personData) => {
            this.person.set(personData);
            this.loading.set(false);
          },
        });
      },
    });
  }

  getIssueReason(reasonId: number): string {
    const reasons: any = {
      1: 'إصدار أول مرة',
      2: 'تجديد',
      3: 'بدل تالف',
      4: 'بدل فاقد',
    };
    return reasons[reasonId] || 'غير معروف';
  }

  onBack() {
    this.location.back();
  }
}
