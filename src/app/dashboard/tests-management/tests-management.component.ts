import {
  Component,
  inject,
  signal,
  computed,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged } from 'rxjs';

import { TestService } from '../../services/test.service';
import { Test } from '../../models/test.model';

@Component({
  selector: 'app-tests-management',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, DatePipe],
  templateUrl: './tests-management.component.html',
  styleUrl: './tests-management.component.css',
})
export class TestsManagementComponent implements OnInit {
  private testService = inject(TestService);
  private destroyRef = inject(DestroyRef);

  allTests = signal<Test[]>([]);
  isLoading = signal(true);
  currentPage = signal(1);
  pageSize = signal(6); // تم تغيير العدد إلى 6 ليناسب العرض الشبكي (3x2 أو 2x3)
  searchTerm = signal('');

  filterControl = new FormControl('', { nonNullable: true });

  // 1. فلترة البيانات مع معالجة القيم غير المعرفة
  filteredTests = computed(() => {
    const term = this.searchTerm().toLowerCase();
    const tests = this.allTests();
    if (!term) return tests;

    return tests.filter((test) => {
      const idStr = test.id?.toString() || '';
      const appIdStr = test.appointmentID?.toString() || '';
      const notesStr = test.notes?.toLowerCase() || '';

      return (
        idStr.includes(term) ||
        appIdStr.includes(term) ||
        notesStr.includes(term)
      );
    });
  });

  // 2. تقسيم البيانات لصفحات
  paginatedTests = computed(() => {
    const startIndex = (this.currentPage() - 1) * this.pageSize();
    return this.filteredTests().slice(startIndex, startIndex + this.pageSize());
  });

  // 3. حساب إجمالي الصفحات
  totalPages = computed(() => {
    const total = Math.ceil(this.filteredTests().length / this.pageSize());
    return total > 0 ? total : 1;
  });

  ngOnInit(): void {
    this.loadTests();

    this.filterControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((value) => {
        this.searchTerm.set(value);
        this.currentPage.set(1);
      });
  }

  loadTests() {
    this.isLoading.set(true);
    this.testService
      .all()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data: Test[]) => {
          this.allTests.set(data);
          this.isLoading.set(false);
        },
        error: () => this.isLoading.set(false),
      });
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update((p) => p + 1);
    }
  }

  prevPage() {
    if (this.currentPage() > 1) {
      this.currentPage.update((p) => p - 1);
    }
  }
}
