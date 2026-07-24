import { Component, inject, OnInit, signal, DestroyRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { tap, debounceTime } from 'rxjs';
import { ApplicationType } from '../../../models/application-type.model';
import { ApplicationTypesService } from '../../../services/application-type.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { NotificationComponent } from '../../../shared/notification/notification.component';

@Component({
  selector: 'app-application-types',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    RouterLink,
    ConfirmationDialogComponent,
    NotificationComponent,
  ],
  templateUrl: './application-types.component.html',
  styleUrl: './application-types.component.css',
})
export class ApplicationTypesComponent implements OnInit {
  // حقن الخدمات
  private typeService = inject(ApplicationTypesService);
  private notify = inject(NotificationService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  // المتغيرات والبيانات
  types: ApplicationType[] = [];
  filteredTypes: ApplicationType[] = [];
  displayedData: ApplicationType[] = [];

  // التحكم في الشبكة والترقيم (تم تحديث pageSize إلى 8 للتوافق مع Grid 2x4 أو 4x2)
  currentPage = 1;
  pageSize = 8;
  filter = new FormControl('', { nonNullable: true });

  // التحكم في الحذف
  isDialogVisible = signal<boolean>(false);
  selectedTypeId: number | null = null;

  ngOnInit(): void {
    this.loadData();

    // مراقبة البحث
    const filterSub = this.filter.valueChanges
      .pipe(
        debounceTime(300),
        tap((val) => this.applyFilter(val)),
      )
      .subscribe();
    this.destroyRef.onDestroy(() => filterSub.unsubscribe());
  }

  loadData() {
    const sub = this.typeService.all().subscribe({
      next: (res) => {
        this.types = res;
        this.filteredTypes = res;
        this.updateDisplayedData();
      },
      error: () =>
        this.notify.showMessage({
          message: 'فشل في جلب البيانات من الخادم',
          status: 'failed',
        }),
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  applyFilter(value: string) {
    const search = value.toLowerCase().trim();
    this.filteredTypes = this.types.filter(
      (t) =>
        t.typeTitle.toLowerCase().includes(search) ||
        t.id.toString().includes(search),
    );
    this.currentPage = 1;
    this.updateDisplayedData();
  }

  updateDisplayedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    this.displayedData = this.filteredTypes.slice(start, start + this.pageSize);
  }

  onNext() {
    if (this.currentPage * this.pageSize < this.filteredTypes.length) {
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

  onDelete(id: number) {
    this.selectedTypeId = id;
    this.isDialogVisible.set(true);
  }

  onDialogResult(confirm: boolean) {
    this.isDialogVisible.set(false);

    if (confirm && this.selectedTypeId !== null) {
      this.typeService.delete(this.selectedTypeId).subscribe({
        next: () => {
          this.notify.showMessage({
            message: 'تم حذف نوع الطلب بنجاح',
            status: 'success',
          });
          this.loadData();
          this.selectedTypeId = null;
        },
        error: () => {
          this.notify.showMessage({
            message: 'لا يمكن حذف هذا العنصر لأنه مرتبط بطلبات أخرى في النظام',
            status: 'failed',
          });
          this.selectedTypeId = null;
        },
      });
    }
  }

  onEdit(id: number) {
    this.router.navigate(['/dashboard/system/add-edit-type'], {
      queryParams: { id: id, mode: 'edit', type: 'application' },
    });
  }
}
