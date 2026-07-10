import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { debounceTime, tap } from 'rxjs';
import { InternationlLicenseService } from '../../../services/international-license.service';
import { NotificationService } from '../../../services/notification.service';
import { NotificationComponent } from '../../../shared/notification/notification.component';

@Component({
  selector: 'app-international-licenses',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    RouterLink,
    NotificationComponent,
  ],
  templateUrl: './international-licenses.component.html',
  styleUrl: './international-licenses.component.css',
})
export class InternationalLicensesComponent implements OnInit {
  private intLicenseService = inject(InternationlLicenseService);
  private notify = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  licenses: any[] = [];
  filteredData: any[] = [];
  displayedData: any[] = [];

  currentPage = 1;
  pageSize = 6;
  filter = new FormControl('', { nonNullable: true });

  ngOnInit(): void {
    this.loadData();
    this.filter.valueChanges
      .pipe(
        debounceTime(300),
        tap((val) => this.applyFilter(val)),
      )
      .subscribe();
  }

  loadData() {
    this.intLicenseService.all().subscribe({
      next: (res) => {
        this.licenses = res;
        this.filteredData = res;
        this.updateDisplayedData();
      },
      error: () =>
        this.notify.showMessage({
          message: 'فشل تحميل الرخص الدولية',
          status: 'failed',
        }),
    });
  }

  applyFilter(value: string) {
    const search = value.toLowerCase().trim();
    this.filteredData = this.licenses.filter(
      (l) =>
        l.internationalLicenseID.toString().includes(search) ||
        l.issuedUsingLocalLicenseID.toString().includes(search),
    );
    this.currentPage = 1;
    this.updateDisplayedData();
  }

  updateDisplayedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.displayedData = this.filteredData.slice(start, start + this.pageSize);
  }

  onNext() {
    if (this.currentPage * this.pageSize < this.filteredData.length) {
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
