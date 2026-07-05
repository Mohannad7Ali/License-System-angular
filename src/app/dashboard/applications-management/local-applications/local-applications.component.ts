import {
  Component,
  OnDestroy,
  OnInit,
  signal,
  inject,
  DestroyRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subscription, tap, debounceTime } from 'rxjs';

import { LocalApplicationView } from '../../../models/local-application.model';
import { LocalApplicationService } from '../../../services/local-application.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { NotificationComponent } from '../../../shared/notification/notification.component';

@Component({
  selector: 'app-local-applications',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    ConfirmationDialogComponent,
    NotificationComponent,
  ],
  templateUrl: './local-applications.component.html',
  styleUrl: './local-applications.component.css',
})
export class LocalApplicationsComponent implements OnInit, OnDestroy {
  // حقن الخدمات
  private localAppService = inject(LocalApplicationService);
  private notifyServ = inject(NotificationService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  // المتغيرات
  subcriptions: Subscription[] = [];
  current_app_id: number | null = null;
  currentPage = 1;
  pageSize = 6;

  applications: LocalApplicationView[] = [];
  filteredApplications: LocalApplicationView[] = [];
  displayedData: LocalApplicationView[] = [];

  filter = new FormControl('', { nonNullable: true });
  isDialogVisible = signal<boolean>(false);

  ngOnInit(): void {
    this.loadData();

    // البحث التلقائي عند الكتابة مع تأخير بسيط للأداء
    const filterSub = this.filter.valueChanges
      .pipe(
        debounceTime(300),
        tap((value) => this.applyFilter(value)),
      )
      .subscribe();

    this.subcriptions.push(filterSub);
  }

  loadData(): void {
    const sub = this.localAppService.getAll().subscribe({
      next: (data) => {
        this.applications = data;
        this.filteredApplications = data;
        this.updateDisplayedData();
      },
      error: () => {
        this.notifyServ.showMessage({
          message: 'حدث خطأ أثناء تحميل بيانات الطلبات المحلية.',
          status: 'failed',
        });
      },
    });
    this.subcriptions.push(sub);
  }

  applyFilter(value: string) {
    const search = value.toLowerCase().trim();
    this.filteredApplications = this.applications.filter(
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
    this.displayedData = this.filteredApplications.slice(
      startIndex,
      startIndex + this.pageSize,
    );
  }

  onNext() {
    if (this.currentPage * this.pageSize < this.filteredApplications.length) {
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

  onCancel(localAppID: number) {
    this.current_app_id = localAppID;
    this.isDialogVisible.set(true);
  }

  onDialogResult(isConfirmed: boolean) {
    this.isDialogVisible.set(false);
    if (isConfirmed && this.current_app_id !== null) {
      this.localAppService.cancel(this.current_app_id).subscribe({
        next: () => {
          this.notifyServ.showMessage({
            message: 'تم إلغاء الطلب بنجاح',
            status: 'success',
          });
          this.loadData();
        },
        error: (err) => {
          this.notifyServ.showMessage({
            message: 'فشل إلغاء الطلب: ' + err.message,
            status: 'failed',
          });
        },
      });
    }
  }

  ngOnDestroy(): void {
    this.subcriptions.forEach((sub) => sub.unsubscribe());
  }
}
