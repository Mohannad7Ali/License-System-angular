import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { MakeAppointmentComponent } from '../make-appointment/make-appointment.component';
import { DialogWrapperComponent } from '../../../shared/dialog-wrapper/dialog-wrapper.component';

@Component({
  selector: 'app-add-edit-appointment',
  standalone: true,
  imports: [CommonModule, MakeAppointmentComponent, DialogWrapperComponent],
  templateUrl: './add-edit-appointment.component.html',
  styleUrl: './add-edit-appointment.component.css',
})
export class AddEditAppointmentComponent implements OnInit {
  mode: string = 'إضافة';
  application_id: number | null = null;
  appointment_id: number | null = null;

  private route = inject(ActivatedRoute);
  private location = inject(Location);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      // التأكد من تحويل القيم لأرقام بشكل صحيح
      const appId = params['application_id'];
      const appointId = params['appointment_id'];

      this.application_id = appId ? Number(appId) : null;
      this.appointment_id = appointId ? Number(appointId) : null;

      this.mode = params['mode'] === 'edit' ? 'تعديل' : 'إضافة';

      this.cdr.detectChanges();
    });
  }

  onClose(event: any) {
    this.location.back();
  }
}
