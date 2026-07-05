// import { Injectable } from '@angular/core';
// import { DRIVER_API_ENDPOINT } from '../environments/endpoints/driver.endpoints';
// import { HttpClient } from '@angular/common/http';
// import { catchError, Observable, throwError } from 'rxjs';
// import { Driver_View } from '../models/driver.model';
// import { ShortLicense } from '../models/license.model';
// import { ShortInternationalLicense } from '../models/internationl-license.model';
// @Injectable({
//   providedIn: 'root',
// })
// export class DriverService {
//   constructor(private http: HttpClient) {}
//   read(ID: number): Observable<Driver_View> {
//     return this.http.get<Driver_View>(DRIVER_API_ENDPOINT.read_view(ID)).pipe(
//       catchError((error) => {
//         if (error.status == 404) {
//           return throwError(() => new Error(`Driver with ID ${ID} NOT Found`));
//         }
//         return throwError(() => new Error(`something error happened`));
//       })
//     );
//   }
//   getAll(): Observable<Driver_View[]> {
//     return this.http.get<Driver_View[]>(DRIVER_API_ENDPOINT.all);
//   }
//   count(): Observable<number> {
//     return this.http.get<number>(DRIVER_API_ENDPOINT.count);
//   }

//   localLicenses(driverid: number): Observable<ShortLicense[]> {
//     return this.http.get<ShortLicense[]>(
//       DRIVER_API_ENDPOINT.localLicenses(driverid)
//     );
//   }

//   internationalLicenses(
//     driverid: number
//   ): Observable<ShortInternationalLicense[]> {
//     return this.http.get<ShortInternationalLicense[]>(
//       DRIVER_API_ENDPOINT.internationalLicenses(driverid)
//     );
//   }
// }

import { Injectable } from '@angular/core';
import { DRIVER_API_ENDPOINT } from '../environments/endpoints/driver.endpoints';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Driver_View } from '../models/driver.model';
import { ShortLicense } from '../models/license.model';
import { ShortInternationalLicense } from '../models/internationl-license.model';

@Injectable({
  providedIn: 'root',
})
export class DriverService {
  constructor(private http: HttpClient) {}

  // 1. قراءة بيانات السائق بصيغة العرض (View) المخصصة للجداول والشاشات
  read(ID: number): Observable<Driver_View> {
    return this.http.get<Driver_View>(DRIVER_API_ENDPOINT.read_view(ID)).pipe(
      catchError((error) => {
        if (error.status == 404) {
          return throwError(() => new Error(`Driver View with ID ${ID} NOT Found`));
        }
        return throwError(() => new Error(error.message || `something error happened`));
      })
    );
  }

  // 2. قراءة بيانات السائق الأساسية (الـ DTO الأصلي) المتوافق مع دالة Read في الـ Controller
  getDriverById(ID: number): Observable<any> {
    return this.http.get<any>(DRIVER_API_ENDPOINT.read(ID)).pipe(
      catchError((error) => {
        if (error.status == 404) {
          return throwError(() => new Error(`Driver with ID ${ID} NOT Found`));
        }
        return throwError(() => new Error(error.message || `something error happened`));
      })
    );
  }

  // 3. جلب القائمة الكاملة للسائقين بصيغة العرض
  getAll(): Observable<Driver_View[]> {
    return this.http.get<Driver_View[]>(DRIVER_API_ENDPOINT.all).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching drivers list'));
      })
    );
  }

  // 4. جلب العدد الإجمالي للسائقين بالنظام
  count(): Observable<number> {
    return this.http.get<number>(DRIVER_API_ENDPOINT.count).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching drivers count'));
      })
    );
  }

  // 5. جلب الرخص المحلية الخاصة بالسائق
  localLicenses(driverid: number): Observable<ShortLicense[]> {
    return this.http.get<ShortLicense[]>(
      DRIVER_API_ENDPOINT.localLicenses(driverid)
    ).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching driver local licenses'));
      })
    );
  }

  // 6. جلب الرخص الدولية الخاصة بالسائق
  internationalLicenses(
    driverid: number
  ): Observable<ShortInternationalLicense[]> {
    return this.http.get<ShortInternationalLicense[]>(
      DRIVER_API_ENDPOINT.internationalLicenses(driverid)
    ).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching driver international licenses'));
      })
    );
  }

  // 7. إضافة سائق جديد في النظام
  create(newDriver: any): Observable<any> {
    return this.http.post<any>(DRIVER_API_ENDPOINT.create, newDriver).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error creating new driver'));
      })
    );
  }

  // 8. تحديث بيانات سائق موجود
  update(id: number, updatedDriver: any): Observable<any> {
    return this.http.put<any>(DRIVER_API_ENDPOINT.update(id), updatedDriver).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error updating driver'));
      })
    );
  }

  // 9. حذف سائق من النظام
  delete(id: number): Observable<any> {
    return this.http.delete<any>(DRIVER_API_ENDPOINT.delete(id)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error deleting driver'));
      })
    );
  }
}