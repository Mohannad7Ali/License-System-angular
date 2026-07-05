// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { catchError, map, Observable, tap, throwError } from 'rxjs';
// import { LICENSE_API_ENDPOINT } from '../environments/endpoints/license.endpoint';
// import { License } from '../models/license.model';
// @Injectable({
//   providedIn: 'root',
// })
// export class LicenseService {
//   constructor(private http: HttpClient) {}
//   count(): Observable<number> {
//     return this.http.get<number>(LICENSE_API_ENDPOINT.count);
//   }
//   read(ID: number): Observable<License> {
//     return this.http.get<License>(`${LICENSE_API_ENDPOINT.read}${ID}`).pipe(
//       catchError((error) => {
//         if (error.status == 404) {
//           return throwError(() => new Error(`License with ID ${ID} NOT Found`));
//         }
//         return throwError(() => new Error('An unexpected error occurred.'));
//       })
//     );
//   }

//   renew(ID: number, notes: string, byUserID: number): Observable<License> {
//     return this.http
//       .get<License>(LICENSE_API_ENDPOINT.renew(ID, notes, byUserID), {
//         observe: 'body',
//       })
//       .pipe(
//         catchError((error) => {
//           if (error.status == 404) {
//             return throwError(
//               () => new Error(`License with ID ${ID} NOT Found`)
//             );
//           }
//           return throwError(() => new Error('An unexpected error occurred.'));
//         }),
//         map((response) => {
//           return response;
//         })
//       );
//   }

//   lostReplacement(ID: number, byUserID: number): Observable<License> {
//     return this.http
//       .get<License>(LICENSE_API_ENDPOINT.lostReplacement(ID, byUserID), {
//         observe: 'body',
//       })
//       .pipe(
//         catchError((error) => {
//           if (error.status == 404) {
//             return throwError(
//               () => new Error(`License with ID ${ID} NOT Found`)
//             );
//           }
//           return throwError(() => new Error('An unexpected error occurred.'));
//         }),
//         map((response) => {
//           return response;
//         })
//       );
//   }

//   damageReplacement(ID: number, byUserID: number): Observable<License> {
//     return this.http
//       .get<License>(LICENSE_API_ENDPOINT.damageReplacement(ID, byUserID), {
//         observe: 'body',
//       })
//       .pipe(
//         catchError((error) => {
//           if (error.status == 404) {
//             return throwError(
//               () => new Error(`License with ID ${ID} NOT Found`)
//             );
//           }
//           return throwError(() => new Error('An unexpected error occurred.'));
//         }),
//         map((response) => {
//           return response;
//         })
//       );
//   }

//   detain(ID: number, fees: number, byUserID: number): Observable<number> {
//     return this.http
//       .patch<number>(LICENSE_API_ENDPOINT.detain(ID, fees, byUserID), {})
//       .pipe(
//         catchError((error) => {
//           if (error.status == 404) {
//             return throwError(
//               () => new Error(`License with ID ${ID} NOT Found`)
//             );
//           }
//           return throwError(() => new Error('An unexpected error occurred.'));
//         }),
//         map((response) => {
//           return response;
//         })
//       );
//   }
//   release(ID: number, byUserID: number): Observable<boolean> {
//     return this.http
//       .patch<boolean>(LICENSE_API_ENDPOINT.release(ID, byUserID), {})
//       .pipe(
//         catchError((error) => {
//           if (error.status == 404) {
//             return throwError(
//               () => new Error(`License with ID ${ID} NOT Found`)
//             );
//           }
//           return throwError(() => new Error('An unexpected error occurred.'));
//         }),
//         map((response) => {
//           //this should return a boolean value
//           return response;
//         })
//       );
//   }

//   isDetained(licenseID: number): Observable<boolean> {
//     return this.http
//       .get<boolean>(LICENSE_API_ENDPOINT.isDetained(licenseID), {
//         observe: 'body',
//       })
//       .pipe(
//         catchError((error) => {
//           if (error.status == 404) {
//             return throwError(
//               () => new Error(`License with ID ${licenseID} NOT Found`)
//             );
//           }
//           return throwError(() => new Error('An unexpected error occurred.'));
//         }),
//         map((response) => {
//           return response;
//         })
//       );
//   }
//   // getAll(): Observable<License[]> {
//   //   // return this.http.get<License[]>(LICENSE_API_ENDPOINT.all);
//   // }
// }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { LICENSE_API_ENDPOINT } from '../environments/endpoints/license.endpoint'; // تأكد من مطابقة الـ s في اسم الملف
import { License } from '../models/license.model';

@Injectable({
  providedIn: 'root',
})
export class LicenseService {
  constructor(private http: HttpClient) {}

  // 1. جلب العدد الإجمالي للرخص
  count(): Observable<number> {
    return this.http.get<number>(LICENSE_API_ENDPOINT.count).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching licenses count'));
      })
    );
  }

  // 2. جلب القائمة الكاملة لجميع الرخص (تم تفعيلها وتأمينها)
  getAll(): Observable<License[]> {
    return this.http.get<License[]>(LICENSE_API_ENDPOINT.all).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching licenses list'));
      })
    );
  }

  // 3. قراءة بيانات رخصة محددة بواسطة الـ ID الخاص بها
  read(ID: number): Observable<License> {
    // ✅ تصحيح طريقة استدعاء الدالة الديناميكية من ملف الـ Endpoints المحدث
    return this.http.get<License>(LICENSE_API_ENDPOINT.read(ID)).pipe(
      catchError((error) => {
        if (error.status == 404) {
          return throwError(() => new Error(`License with ID ${ID} NOT Found`));
        }
        return throwError(() => new Error(error.message || 'An unexpected error occurred.'));
      })
    );
  }

  // 4. تجديد رخصة القيادة
  renew(ID: number, notes: string, byUserID: number): Observable<License> {
    return this.http
      // ✅ تصحيح ترتيب الـ parameters لتتطابق تماماً مع دالة الـ Endpoint والسيرفر
      .get<License>(LICENSE_API_ENDPOINT.renew(ID, byUserID, notes), {
        observe: 'body',
      })
      .pipe(
        catchError((error) => {
          if (error.status == 404) {
            return throwError(() => new Error(`License with ID ${ID} NOT Found`));
          }
          return throwError(() => new Error(error.message || 'An unexpected error occurred.'));
        })
      );
  }

  // 5. إصدار بدل ضائع لرخصة
  lostReplacement(ID: number, byUserID: number): Observable<License> {
    return this.http
      .get<License>(LICENSE_API_ENDPOINT.lostReplacement(ID, byUserID), {
        observe: 'body',
      })
      .pipe(
        catchError((error) => {
          if (error.status == 404) {
            return throwError(() => new Error(`License with ID ${ID} NOT Found`));
          }
          return throwError(() => new Error(error.message || 'An unexpected error occurred.'));
        })
      );
  }

  // 6. إصدار بدل تالف لرخصة
  damageReplacement(ID: number, byUserID: number): Observable<License> {
    return this.http
      .get<License>(LICENSE_API_ENDPOINT.damageReplacement(ID, byUserID), {
        observe: 'body',
      })
      .pipe(
        catchError((error) => {
          if (error.status == 404) {
            return throwError(() => new Error(`License with ID ${ID} NOT Found`));
          }
          return throwError(() => new Error(error.message || 'An unexpected error occurred.'));
        })
      );
  }

  // 7. حجز واحتجاز رخصة قيادة
  detain(ID: number, fees: number, byUserID: number): Observable<number> {
    return this.http
      .patch<number>(LICENSE_API_ENDPOINT.detain(ID, fees, byUserID), {})
      .pipe(
        catchError((error) => {
          if (error.status == 404) {
            return throwError(() => new Error(`License with ID ${ID} NOT Found`));
          }
          return throwError(() => new Error(error.message || 'An unexpected error occurred.'));
        })
      );
  }

  // 8. فك احتجاز رخصة قيادة
  release(ID: number, byUserID: number): Observable<boolean> {
    return this.http
      .patch<boolean>(LICENSE_API_ENDPOINT.release(ID, byUserID), {})
      .pipe(
        catchError((error) => {
          if (error.status == 404) {
            return throwError(() => new Error(`License with ID ${ID} NOT Found`));
          }
          return throwError(() => new Error(error.message || 'An unexpected error occurred.'));
        })
      );
  }

  // 9. التحقق من حالة احتجاز الرخصة
  isDetained(licenseID: number): Observable<boolean> {
    return this.http
      .get<boolean>(LICENSE_API_ENDPOINT.isDetained(licenseID), {
        observe: 'body',
      })
      .pipe(
        catchError((error) => {
          if (error.status == 404) {
            return throwError(() => new Error(`License with ID ${licenseID} NOT Found`));
          }
          return throwError(() => new Error(error.message || 'An unexpected error occurred.'));
        })
      );
  }

  // 10. تفعيل رخصة قيادة (HttpPatch مضاف للمطابقة الكاملة مع السيرفر)
  activate(id: number): Observable<boolean> {
    return this.http.patch<boolean>(LICENSE_API_ENDPOINT.activate(id), {}).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error activating license'));
      })
    );
  }

  // 11. تعطيل رخصة قيادة (HttpPatch مضاف للمطابقة الكاملة مع السيرفر)
  deactivate(id: number): Observable<boolean> {
    return this.http.patch<boolean>(LICENSE_API_ENDPOINT.deactivate(id), {}).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error deactivating license'));
      })
    );
  }

  // 12. إنشاء رخصة قيادة جديدة
  create(newLicense: License): Observable<License> {
    return this.http.post<License>(LICENSE_API_ENDPOINT.create, newLicense).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error creating license'));
      })
    );
  }

  // 13. تحديث بيانات رخصة قيادة
  update(id: number, updatedLicense: License): Observable<License> {
    return this.http.put<License>(LICENSE_API_ENDPOINT.update(id), updatedLicense).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error updating license'));
      })
    );
  }

  // 14. حذف رخصة قيادة من النظام
  delete(id: number): Observable<any> {
    return this.http.delete<any>(LICENSE_API_ENDPOINT.delete(id)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error deleting license'));
      })
    );
  }
}