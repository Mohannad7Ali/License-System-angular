import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { tap, debounceTime } from 'rxjs';

import { Driver_View } from '../../../models/driver.model';
import { DriverService } from '../../../services/driver.service';
import { NotificationComponent } from '../../../shared/notification/notification.component';
import { NotificationService } from '../../../services/notification.service';

@Component({
  selector: 'app-drivers',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    DatePipe,
    NotificationComponent,
  ],
  templateUrl: './drivers.component.html',
  styleUrl: './drivers.component.css',
})
export class DriversComponent implements OnInit {
  // الخدمات
  private driverService = inject(DriverService);
  private notifyServ = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  // التحكم في الجدول
  currentPage = 1;
  pageSize = 6;
  isLoading = signal<boolean>(true);

  // البيانات
  drivers: Driver_View[] = [];
  filteredDrivers: Driver_View[] = [];
  displayedData: Driver_View[] = [];

  filter = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.loadData();

    // مراقبة البحث مع تأخير بسيط للأداء
    const filterSub = this.filter.valueChanges
      .pipe(
        debounceTime(300),
        tap((val) => this.applyFilter(val)),
      )
      .subscribe();

    this.destroyRef.onDestroy(() => filterSub.unsubscribe());
  }

  loadData() {
    this.isLoading.set(true);
    this.driverService.getAll().subscribe({
      next: (response) => {
        this.drivers = response;
        this.filteredDrivers = response;
        this.updateDisplayedData();
        this.isLoading.set(false);
      },
      error: () => {
        this.notifyServ.showMessage({
          message: 'فشل في تحميل قائمة السائقين',
          status: 'failed',
        });
        this.isLoading.set(false);
      },
    });
  }

  applyFilter(value: string) {
    const search = value.toLowerCase().trim();
    this.filteredDrivers = this.drivers.filter(
      (item) =>
        item.fullName.toLowerCase().includes(search) ||
        item.nationalID.toLowerCase().includes(search) ||
        item.id.toString().includes(search),
    );
    this.currentPage = 1;
    this.updateDisplayedData();
  }

  updateDisplayedData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.displayedData = this.filteredDrivers.slice(
      startIndex,
      startIndex + this.pageSize,
    );
  }

  onNext() {
    if (this.currentPage * this.pageSize < this.filteredDrivers.length) {
      this.currentPage++;
      this.updateDisplayedData();
    }
  }

  onPrevious() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateDisplayedData();
    }
  }
}
