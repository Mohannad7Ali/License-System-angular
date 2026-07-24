import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { tap, debounceTime } from 'rxjs';
import { TestTypesService } from '../../../services/test-type.service';
import { NotificationService } from '../../../services/notification.service';
import { ConfirmationDialogComponent } from '../../../shared/confirmation-dialog/confirmation-dialog.component';
import { NotificationComponent } from '../../../shared/notification/notification.component';

@Component({
  selector: 'app-tests',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CurrencyPipe,
    RouterLink,
    ConfirmationDialogComponent,
    NotificationComponent,
  ],
  templateUrl: './tests.component.html',
  styleUrl: './tests.component.css',
})
export class TestsComponent implements OnInit {
  private typesService = inject(TestTypesService);
  private notify = inject(NotificationService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  types: any[] = [];
  filteredTypes: any[] = [];
  displayedData: any[] = [];

  currentPage = 1;
  pageSize = 6; // تم تعديل العدد ليتناسب مع الشبكة (3x2 أو 2x3)
  filter = new FormControl('', { nonNullable: true });
  isDialogVisible = signal<boolean>(false);
  selectedTestId: number | null = null;

  ngOnInit(): void {
    this.loadData();
    const filterSub = this.filter.valueChanges
      .pipe(
        debounceTime(300),
        tap((val) => this.applyFilter(val)),
      )
      .subscribe();
    this.destroyRef.onDestroy(() => filterSub.unsubscribe());
  }

  loadData() {
    const sub = this.typesService.all().subscribe({
      next: (res) => {
        this.types = res;
        this.filteredTypes = res;
        this.updateDisplayedData();
      },
      error: () =>
        this.notify.showMessage({
          message: 'فشل جلب أنواع الاختبارات',
          status: 'failed',
        }),
    });
    this.destroyRef.onDestroy(() => sub.unsubscribe());
  }

  applyFilter(value: string) {
    const search = value.toLowerCase().trim();
    this.filteredTypes = this.types.filter(
      (t) =>
        t.testTypeTitle.toLowerCase().includes(search) ||
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

  onEdit(id: number) {
    this.router.navigate(['/dashboard/system/add-edit-type'], {
      queryParams: { id, mode: 'edit', type: 'test' },
    });
  }

  onDelete(id: number) {
    this.selectedTestId = id;
    this.isDialogVisible.set(true);
  }

  onDialogResult(confirm: boolean) {
    this.isDialogVisible.set(false);
    if (confirm && this.selectedTestId) {
      this.typesService.delete(this.selectedTestId).subscribe({
        next: () => {
          this.notify.showMessage({
            message: 'تم حذف نوع الاختبار بنجاح',
            status: 'success',
          });
          this.loadData();
        },
        error: () =>
          this.notify.showMessage({
            message: 'لا يمكن الحذف لارتباط النوع ببيانات أخرى',
            status: 'failed',
          }),
      });
    }
  }
}
