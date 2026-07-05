// import { ComponentFixture, TestBed } from '@angular/core/testing';

// import { TestsManagementComponent } from './tests-management.component';

// describe('TestsManagementComponent', () => {
//   let component: TestsManagementComponent;
//   let fixture: ComponentFixture<TestsManagementComponent>;

//   beforeEach(async () => {
//     await TestBed.configureTestingModule({
//       imports: [TestsManagementComponent]
//     })
//     .compileComponents();

//     fixture = TestBed.createComponent(TestsManagementComponent);
//     component = fixture.componentInstance;
//     fixture.detectChanges();
//   });

//   it('should create', () => {
//     expect(component).toBeTruthy();
//   });
// });

import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Subject, takeUntil, tap } from 'rxjs';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

// 💡 تأكد من استيراد الخدمة الصحيحة الخاصة بالاختبارات (Tests)
import { TestService } from '../../services/test.service'; 

@Component({
  selector: 'app-tests-management',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe, RouterLink],
  templateUrl: './tests-management.component.html',
  styleUrl: './tests-management.component.css',
})
export class TestsManagementComponent implements OnInit {
  currentPage = 1;
  pageSize = 5;

  // استخدام any[] لمنع تعارض الـ HTML مع الـ Compiler
  tests: any[] = [];
  filteredTests: any[] = [];
  displayedData: any[] = [];

  private destroyRef = inject(DestroyRef);
  filter = new FormControl('', { nonNullable: true });
  private destroy$ = new Subject<void>();

  constructor(private testService: TestService) {}

  ngOnInit(): void {
    const subscription = this.testService
      .all() // الدالة المسؤولة عن جلب قائمة الاختبارات (Tests)
      .pipe(
        tap((response: any[]) => {
          if (!response) return;

          // ✅ الـ Mapping الاحتياطي الشامل ليغطي كافة مسميات الـ Swagger المحتملة للـ API
          const mappedData = response.map((test) => ({
            id: test.testID ?? test.id ?? test.testAppointmentID,
            appointmentID: test.testAppointmentID ?? test.appointmentID,
            result: test.testResult ?? test.result, // يتوقع القيمة true لـ PASSED أو false لـ FAILED
            notes: test.notes ?? test.notesDescription ?? ''
          }));

          this.tests = mappedData;
          this.filteredTests = mappedData;
          this.updateDisplayedData();
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    this.destroyRef.onDestroy(() => {
      subscription.unsubscribe();
      this.destroy$.next();
      this.destroy$.complete();
    });

    this.filter.valueChanges
      .pipe(
        tap((value) => {
          this.applyFilter(value);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();
  }

  applyFilter(value: string) {
    const lowerCaseFilter = value.toLowerCase();
    this.filteredTests = this.tests.filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(lowerCaseFilter)
      )
    );
    this.currentPage = 1;
    this.updateDisplayedData();
  }

  updateDisplayedData() {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.displayedData = this.filteredTests.slice(startIndex, endIndex);
  }

  onNext() {
    if (this.currentPage * this.pageSize < this.filteredTests.length) {
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