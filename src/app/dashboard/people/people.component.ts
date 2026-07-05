import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { PersonService } from '../../services/person.service';
import { NotificationService } from '../../services/notification.service';
import { Person } from '../../models/person.model';
import { Subscription, tap, debounceTime } from 'rxjs';
import { ConfirmationDialogComponent } from '../../shared/confirmation-dialog/confirmation-dialog.component';
import { NotificationComponent } from '../../shared/notification/notification.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ConfirmationDialogComponent,
    NotificationComponent,
  ],
  templateUrl: './people.component.html',
  styleUrls: ['./people.component.css'],
})
export class PeopleComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];

  people: Person[] = [];
  filteredData: Person[] = [];
  displayedData: Person[] = [];

  currentPage = 1;
  pageSize = 8;

  // تعديل طريقة تعريف الـ FormControl لضمان استقرار القيمة البدئية
  filter = new FormControl<string>('');
  isDialogVisible = signal<boolean>(false);
  selectedPersonId: number | null = null;

  constructor(
    private personService: PersonService,
    private notifyServ: NotificationService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.loadPeople();

    // مراقبة التغيير مع حماية ضد القيم الفارغة أو الـ null
    const filterSub = this.filter.valueChanges
      .pipe(
        debounceTime(300),
        tap((value) => this.applyFilter(value || '')),
      )
      .subscribe();

    this.subscriptions.push(filterSub);
  }

  loadPeople() {
    const sub = this.personService.all().subscribe({
      next: (data) => {
        this.people = data || []; // حماية في حال واجهة البرمجية أعادت null
        this.applyFilter(this.filter.value || ''); // تطبيق الفلتر الحالي مباشرة لتحديث displayedData
      },
      error: () =>
        this.notifyServ.showMessage({
          message: 'فشل في تحميل قائمة الأشخاص',
          status: 'failed',
        }),
    });

    this.subscriptions.push(sub);
  }

  applyFilter(value: string) {
    const search = value.toLowerCase().trim();

    if (!search) {
      this.filteredData = this.people;
    }
    {
      this.filteredData = this.people.filter(
        (p) =>
          p.nationalNumber?.toLowerCase().includes(search) ||
          p.firstName?.toLowerCase().includes(search) ||
          p.lastName?.toLowerCase().includes(search) ||
          p.phoneNumber?.includes(search),
      );
    }

    this.currentPage = 1;
    this.updateDisplayedData();
  }

  updateDisplayedData() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedData = this.filteredData.slice(start, end);
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

  onAddPerson() {
    this.router.navigate(['/dashboard/people/add']);
  }

  onEdit(id: number) {
    this.router.navigate(['/dashboard/people/edit', id]);
  }

  onDelete(id: number) {
    this.selectedPersonId = id;
    this.isDialogVisible.set(true);
  }

  onDialogResult(isConfirmed: boolean) {
    this.isDialogVisible.set(false);
    if (isConfirmed && this.selectedPersonId !== null) {
      const deleteSub = this.personService
        .delete(this.selectedPersonId)
        .subscribe({
          next: () => {
            this.notifyServ.showMessage({
              message: 'تم حذف الشخص بنجاح',
              status: 'success',
            });
            this.loadPeople();
          },
          error: () =>
            this.notifyServ.showMessage({
              message: 'لا يمكن حذف هذا الشخص لارتباطه ببيانات أخرى',
              status: 'failed',
            }),
        });

      this.subscriptions.push(deleteSub);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
