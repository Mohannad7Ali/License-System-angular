import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ApplicationTypesService } from '../../../services/application-type.service';
import { TestTypesService } from '../../../services/test-type.service';
import { NotificationService } from '../../../services/notification.service';
import { ApplicationType } from '../../../models/application-type.model';
import { TestType } from '../../../models/test-type.model';

@Component({
  selector: 'app-add-edit-type',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './add-edit-type.component.html',
  styleUrls: ['./add-edit-type.component.css'],
})
export class AddEditTypeComponent implements OnInit {
  // الحقول الأساسية
  type_form!: FormGroup;
  mode: 'add' | 'edit' = 'add';
  targetType: 'application' | 'test' = 'application';
  id: number | null = null;

  // الخدمات
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private appTypeService = inject(ApplicationTypesService);
  private testTypeService = inject(TestTypesService);
  private notify = inject(NotificationService);

  ngOnInit(): void {
    this.initForm();

    // جلب البيانات من الـ Query Params
    this.route.queryParams.subscribe((params) => {
      this.id = params['id'] ? Number(params['id']) : null;
      this.mode = params['mode'] || 'add';
      this.targetType = params['type'] || 'application';

      if (this.mode === 'edit' && this.id) {
        this.loadData();
      }
    });
  }

  private initForm() {
    this.type_form = this.fb.group({
      title: ['', [Validators.required, Validators.maxLength(100)]],
      fees: [0, [Validators.required, Validators.min(0)]],
      description: [''], // الوصف مطلوب فقط في أنواع الاختبارات
    });
  }

  private loadData() {
    if (this.targetType === 'application') {
      this.appTypeService.getById(this.id!).subscribe({
        next: (res: ApplicationType) => {
          this.type_form.patchValue({
            title: res.typeTitle,
            fees: res.typeFee,
          });
        },
        error: (err: any) => this.handleError(err),
      });
    } else {
      this.testTypeService.get(this.id!).subscribe({
        next: (res: any) => {
          // استخدمنا any هنا لأن مسميات TestType تختلف
          this.type_form.patchValue({
            title: res.testTypeTitle,
            fees: res.testTypeFees,
            description: res.testTypeDescription,
          });
        },
        error: (err: any) => this.handleError(err),
      });
    }
  }

  onSave() {
    if (this.type_form.invalid) return;

    const values = this.type_form.value;

    if (this.targetType === 'application') {
      const payload: ApplicationType = {
        id: this.id || 0,
        typeTitle: values.title,
        typeFee: values.fees,
      };

      const request =
        this.mode === 'add'
          ? this.appTypeService.add(payload)
          : this.appTypeService.update(this.id!, payload);
      request.subscribe({
        next: () => this.onSuccess(),
        error: (err: any) => this.handleError(err),
      });
    } else {
      const payload: any = {
        id: this.id || 0,
        testTypeTitle: values.title,
        testTypeFees: values.fees,
        testTypeDescription: values.description || values.title,
      };

      const request =
        this.mode === 'add'
          ? this.testTypeService.add(payload)
          : this.testTypeService.update(this.id!, payload);
      request.subscribe({
        next: () => this.onSuccess(),
        error: (err: any) => this.handleError(err),
      });
    }
  }

  onSuccess() {
    this.notify.showMessage({
      message: 'تم حفظ البيانات بنجاح',
      status: 'success',
    });
    this.location.back();
  }

  private handleError(err: any) {
    this.notify.showMessage({
      message: err.error?.message || 'حدث خطأ في العملية، يرجى المحاولة لاحقاً',
      status: 'failed',
    });
  }
}
