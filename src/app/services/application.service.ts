// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { Application } from '../models/application.model';
// import { APPLICATION_API_ENDPOINT } from '../environments/endpoints/application.endpoints';
// import { catchError, Observable, tap, throwError } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class ApplicationService {
//   constructor(private http: HttpClient) {}

//   create(new_application: Application): Observable<Application> {
//     return this.http.post<Application>(
//       APPLICATION_API_ENDPOINT.create,
//       new_application
//     );
//   }
//   read(ID: number): Observable<Application> {
//     return this.http
//       .get<Application>(`${APPLICATION_API_ENDPOINT.read}${ID}`)
//       .pipe(
//         catchError((error) => {
//           if (error.status == 404) {
//             throwError(() => new Error(`Application with ID ${ID} NOT Found`));
//           }
//           return throwError(() => new Error('An unexpected error occurred.'));
//         })
//       );
//   }
//   count(): Observable<number> {
//     return this.http.get<number>(APPLICATION_API_ENDPOINT.count);
//   }
// }
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Application } from '../models/application.model';
import { APPLICATION_API_ENDPOINT } from '../environments/endpoints/application.endpoints';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ApplicationService {
  constructor(private http: HttpClient) {}

  // 1. إنشاء طلب جديد
  create(new_application: Application): Observable<Application> {
    return this.http.post<Application>(
      APPLICATION_API_ENDPOINT.create,
      new_application
    ).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error Creating Application'));
      })
    );
  }

  // 2. قراءة بيانات طلب محدد بواسطة الـ ID
  read(ID: number): Observable<Application> {
    return this.http
      // ✅ تم التعديل للاستدعاء كدالة ديناميكية آمنة
      .get<Application>(APPLICATION_API_ENDPOINT.read(ID))
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            // ✅ إضافة return لضمان تمرير الخطأ بشكل سليم للـ Component
            return throwError(() => new Error(`Application with ID ${ID} NOT Found`));
          }
          return throwError(() => new Error(error.message || 'An unexpected error occurred.'));
        })
      );
  }

  // 3. تحديث بيانات طلب موجود
  update(id: number, updated_application: Application): Observable<Application> {
    return this.http
      .put<Application>(APPLICATION_API_ENDPOINT.update(id), updated_application)
      .pipe(
        catchError((error) => {
          return throwError(() => new Error(error.message || 'Error Updating Application'));
        })
      );
  }

  // 4. حذف طلب معين من النظام
  delete(id: number): Observable<any> {
    return this.http
      .delete<any>(APPLICATION_API_ENDPOINT.delete(id))
      .pipe(
        catchError((error) => {
          return throwError(() => new Error(error.message || 'Error Deleting Application'));
        })
      );
  }

  // 5. تعديل حالة الطلب إلى "مكتمل" (Complete)
  setCompleted(id: number): Observable<boolean> {
    return this.http
      .patch<boolean>(APPLICATION_API_ENDPOINT.complete(id), {})
      .pipe(
        catchError((error) => {
          return throwError(() => new Error(error.message || 'Error Completing Application'));
        })
      );
  }

  // 6. تعديل حالة الطلب إلى "ملغي" (Cancel)
  cancel(id: number): Observable<boolean> {
    return this.http
      .patch<boolean>(APPLICATION_API_ENDPOINT.cancel(id), {})
      .pipe(
        catchError((error) => {
          return throwError(() => new Error(error.message || 'Error Canceling Application'));
        })
      );
  }

  // 7. جلب قيمة الرسوم المدفوعة للطلب
  getPaidFees(id: number): Observable<number> {
    return this.http
      .get<number>(APPLICATION_API_ENDPOINT.paidFees(id))
      .pipe(
        catchError((error) => {
          return throwError(() => new Error(error.message || 'Error fetching paid fees'));
        })
      );
  }

  // 8. جلب العدد الإجمالي للطلبات (للـ Dashboard الإحصائي)
  count(): Observable<number> {
    return this.http.get<number>(APPLICATION_API_ENDPOINT.count).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching application count'));
      })
    );
  }
}