// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { catchError, Observable, throwError } from 'rxjs';
// import { INTERNATIONAL_API_ENDPOINTS } from '../environments/endpoints/international-license.endpoints';
// import { InternationalLicense } from '../models/internationl-license.model';

// @Injectable({
//   providedIn: 'root',
// })
// export class InternationlLicenseService {
//   constructor(private http: HttpClient) {}

//   read(id: number): Observable<InternationalLicense> {
//     return this.http
//       .get<InternationalLicense>(INTERNATIONAL_API_ENDPOINTS.read(id))
//       .pipe(
//         catchError((error) => {
//           return throwError(() => new Error(error));
//         })
//       );
//   }
//   all(): Observable<InternationalLicense[]> {
//     return this.http.get<InternationalLicense[]>(
//       INTERNATIONAL_API_ENDPOINTS.all
//     );
//   }
// }

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { INTERNATIONAL_API_ENDPOINTS } from '../environments/endpoints/international-license.endpoints';
import { InternationalLicense } from '../models/internationl-license.model';

@Injectable({
  providedIn: 'root',
})
export class InternationlLicenseService {
  constructor(private http: HttpClient) {}

  // 1. قراءة بيانات رخصة دولية بواسطة الـ ID الخاص بها
  read(id: number): Observable<InternationalLicense> {
    return this.http
      .get<InternationalLicense>(INTERNATIONAL_API_ENDPOINTS.read(id))
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            return throwError(() => new Error(`International License with ID ${id} NOT Found`));
          }
          // ✅ تصحيح استخراج الرسالة النصية للخطأ بدلاً من تمرير الكائن بالكامل
          return throwError(() => new Error(error.message || 'An unexpected error happened'));
        })
      );
  }

  // 2. جلب القائمة الكاملة لجميع الرخص الدولية
  all(): Observable<InternationalLicense[]> {
    return this.http.get<InternationalLicense[]>(
      INTERNATIONAL_API_ENDPOINTS.all
    ).pipe(
      catchError((error) => {
        // ✅ تأمين دالة الجلب بمعالج أخطاء مخصص
        return throwError(() => new Error(error.message || 'Error fetching international licenses'));
      })
    );
  }

  // 3. إصدار / إنشاء رخصة قيادة دولية جديدة
  create(newLicense: InternationalLicense): Observable<InternationalLicense> {
    return this.http.post<InternationalLicense>(INTERNATIONAL_API_ENDPOINTS.create, newLicense).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error creating international license'));
      })
    );
  }

  // 4. تحديث بيانات رخصة دولية بالكامل
  update(id: number, updatedLicense: InternationalLicense): Observable<InternationalLicense> {
    return this.http.put<InternationalLicense>(INTERNATIONAL_API_ENDPOINTS.update(id), updatedLicense).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error updating international license'));
      })
    );
  }

  // 5. حذف رخصة دولية من النظام
  delete(id: number): Observable<any> {
    return this.http.delete<any>(INTERNATIONAL_API_ENDPOINTS.delete(id)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error deleting international license'));
      })
    );
  }
}