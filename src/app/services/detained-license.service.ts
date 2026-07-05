// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { DETAINED_LICENSE_API_ENDPOINT } from '../environments/endpoints/detained-license.endpoints';
// import { DetainedLicense } from '../models/detained-license.model';
// import { catchError, Observable, throwError } from 'rxjs';
// @Injectable({
//   providedIn: 'root',
// })
// export class DetainedLicenseService {
//   constructor(private http: HttpClient) {}

//   read(LicenceID: number): Observable<DetainedLicense> {
//     return this.http
//       .get<DetainedLicense>(
//         DETAINED_LICENSE_API_ENDPOINT.read_bu_licenseID(LicenceID),
//         {
//           observe: 'body',
//         }
//       )
//       .pipe(
//         catchError((error) => {
//           if (error.status == 404) {
//             return throwError(
//               () => new Error(`Detaied license with ID ${LicenceID} NOT found`)
//             );
//           }
//           return throwError(() => new Error('An unexpected error happened'));
//         })
//       );
//   }
//   all(): Observable<DetainedLicense[]> {
//     return this.http.get<DetainedLicense[]>(DETAINED_LICENSE_API_ENDPOINT.all);
//   }
// }

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DETAINED_LICENSE_API_ENDPOINT } from '../environments/endpoints/detained-license.endpoints';
import { DetainedLicense } from '../models/detained-license.model';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DetainedLicenseService {
  constructor(private http: HttpClient) {}

  // 1. قراءة بيانات الاحتجاز بواسطة الـ ID الخاص بالرخصة (License ID)
  read(LicenceID: number): Observable<DetainedLicense> {
    return this.http
      .get<DetainedLicense>(
        // ✅ تم تحديث اسم الدالة ليتوافق مع ملف الـ Endpoints المحدث
        DETAINED_LICENSE_API_ENDPOINT.read_by_licenseID(LicenceID),
        {
          observe: 'body',
        }
      )
      .pipe(
        catchError((error) => {
          if (error.status == 404) {
            return throwError(
              // ✅ تصحيح إملائي لـ Detained
              () => new Error(`Detained license with License ID ${LicenceID} NOT found`)
            );
          }
          return throwError(() => new Error(error.message || 'An unexpected error happened'));
        })
      );
  }

  // 2. جلب قائمة العرض الشاملة لجميع الرخص المحتجزة
  all(): Observable<DetainedLicense[]> {
    return this.http.get<DetainedLicense[]>(DETAINED_LICENSE_API_ENDPOINT.all).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching detained licenses'));
      })
    );
  }

  // 3. قراءة بيانات الاحتجاز بواسطة الـ ID الخاص بـ Detain نفسه
  getById(id: number): Observable<DetainedLicense> {
    return this.http.get<DetainedLicense>(DETAINED_LICENSE_API_ENDPOINT.read(id)).pipe(
      catchError((error) => {
        if (error.status == 404) {
          return throwError(() => new Error(`Detain Record with ID ${id} NOT found`));
        }
        return throwError(() => new Error(error.message || 'An unexpected error happened'));
      })
    );
  }

  // 4. حجز / احتجاز رخصة جديدة
  create(newDetain: DetainedLicense): Observable<DetainedLicense> {
    return this.http.post<DetainedLicense>(DETAINED_LICENSE_API_ENDPOINT.create, newDetain).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error creating detain record'));
      })
    );
  }

  // 5. تحديث بيانات الاحتجاز بالكامل
  update(id: number, updatedDetain: DetainedLicense): Observable<DetainedLicense> {
    return this.http.put<DetainedLicense>(DETAINED_LICENSE_API_ENDPOINT.update(id), updatedDetain).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error updating detain record'));
      })
    );
  }

  // 6. حذف سجل احتجاز
  delete(id: number): Observable<any> {
    return this.http.delete<any>(DETAINED_LICENSE_API_ENDPOINT.delete(id)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error deleting detain record'));
      })
    );
  }
}