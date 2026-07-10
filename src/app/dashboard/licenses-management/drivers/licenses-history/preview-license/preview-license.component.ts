import { Component, OnInit, inject, signal } from '@angular/core';
import {
  CommonModule,
  DatePipe,
  CurrencyPipe,
  Location,
} from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { LicenseService } from '../../../../../services/license.service';
import { PersonService } from '../../../../../services/person.service';
import { DriverService } from '../../../../../services/driver.service';
import { DialogWrapperComponent } from '../../../../../shared/dialog-wrapper/dialog-wrapper.component';

@Component({
  selector: 'app-preview-license-local',
  standalone: true,
  imports: [CommonModule, DatePipe, CurrencyPipe, DialogWrapperComponent],
  templateUrl: './preview-license.component.html',
  styleUrl: './preview-license.component.css',
})
export class PreviewLicenseComponent implements OnInit {
  licenseId: number | null = null;
  license = signal<any | null>(null);
  person = signal<any | null>(null);
  loading = signal<boolean>(true);

  private route = inject(ActivatedRoute);
  private licenseService = inject(LicenseService);
  private personService = inject(PersonService);
  private driverService = inject(DriverService);
  private location = inject(Location);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.licenseId = +params['id'];
      if (this.licenseId) this.loadData();
    });
  }

  loadData() {
    this.licenseService.read(this.licenseId!).subscribe((res) => {
      this.license.set(res);
      this.driverService.getDriverById(res.driverID).subscribe((driver) => {
        this.personService.read(driver.personID).subscribe((p) => {
          this.person.set(p);
          this.loading.set(false);
        });
      });
    });
  }

  // دالة الطباعة
  onPrint() {
    window.print();
  }

  onBack() {
    this.location.back();
  }
}
