import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { APPOINTMENT_API_ENDPOINT } from '../environments/endpoints/appointment.endpoints';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Appointment, Appointment_View } from '../models/appointment.model';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  private http = inject(HttpClient);

  // 1. جلب تفاصيل الموعد بصيغة العرض (View)
  readView(id: number): Observable<Appointment_View> {
    return this.http
      .get<Appointment_View>(APPOINTMENT_API_ENDPOINT.readView(id))
      .pipe(
        catchError((error) =>
          throwError(() => new Error(error.message || 'خطأ في جلب عرض الموعد')),
        ),
      );
  }

  // 2. قراءة كائن الموعد الأساسي
  getById(id: number): Observable<Appointment> {
    return this.http
      .get<Appointment>(APPOINTMENT_API_ENDPOINT.readById(id))
      .pipe(
        catchError((error) =>
          throwError(() => new Error(`الموعد رقم ${id} غير موجود`)),
        ),
      );
  }

  // 3. إنشاء موعد جديد
  create(new_appointment: any): Observable<any> {
    return this.http
      .post<any>(APPOINTMENT_API_ENDPOINT.create, new_appointment)
      .pipe(
        catchError((error) =>
          throwError(() => new Error(error.message || 'فشل إنشاء الموعد')),
        ),
      );
  }

  // 4. حذف موعد (تم حل مشكلة الـ Parsing هنا)
  delete(id: number): Observable<string> {
    return this.http
      .delete(APPOINTMENT_API_ENDPOINT.delete(id), {
        responseType: 'text', // ✅ حل مشكلة الـ Parsing لأن السيرفر يرسل نصاً
      })
      .pipe(
        catchError((error) =>
          throwError(() => new Error(error.message || 'فشل حذف الموعد')),
        ),
      );
  }

  // 5. التحقق من وجود موعد نشط
  isThereAnActiveAppointment(
    testType: number,
    localApp: number,
  ): Observable<boolean> {
    return this.http.get<boolean>(
      APPOINTMENT_API_ENDPOINT.active_appointments(testType, localApp),
    );
  }

  // 6. جلب كل المواعيد
  appointments(): Observable<Appointment_View[]> {
    return this.http.get<Appointment_View[]>(APPOINTMENT_API_ENDPOINT.all);
  }

  // 7. تحديث تاريخ الموعد (PUT + Text Response)
  updateDate(id: number, new_date: string): Observable<string> {
    return this.http
      .put(
        APPOINTMENT_API_ENDPOINT.updateDate(id, new_date),
        {},
        {
          responseType: 'text', // ✅ حل مشكلة الـ Parsing
        },
      )
      .pipe(
        map((res) => res),
        catchError((error) =>
          throwError(() => new Error(error.message || 'فشل تحديث التاريخ')),
        ),
      );
  }

  // الدوال الإضافية المطلوبة للـ Agent
  getAppointmentsPerTestType(
    localAppId: number,
    testTypeId: number,
  ): Observable<any[]> {
    return this.http.get<any[]>(
      APPOINTMENT_API_ENDPOINT.allAppointmentsPerTestType(
        testTypeId,
        localAppId,
      ),
    );
  }
}
