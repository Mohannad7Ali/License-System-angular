// import { Injectable } from '@angular/core';
// import { LICENSE_CLASS_API_ENDPOINT } from '../environments/endpoints/licenseClass.endpoint';
// import { HttpClient } from '@angular/common/http';
// import { LicenseClass } from '../models/license-class.model';
// import { Observable } from 'rxjs';
// @Injectable({
//   providedIn: 'root',
// })
// export class LicenseClassService {
//   constructor(private http: HttpClient) {}
//   getLicenseClass(ID: number): Observable<LicenseClass> {
//     return this.http.get<LicenseClass>(
//       `${LICENSE_CLASS_API_ENDPOINT.read}${ID}`
//     );
//   }
//   getAllClasses(): Observable<LicenseClass[]> {
//     return this.http.get<LicenseClass[]>(LICENSE_CLASS_API_ENDPOINT.allClasses);
//   }
// }
import { Injectable } from '@angular/core';
import { LICENSE_CLASS_API_ENDPOINT } from '../environments/endpoints/licenseClass.endpoint';
import { HttpClient } from '@angular/common/http';
import { LicenseClass } from '../models/license-class.model';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LicenseClassService {
  constructor(private http: HttpClient) {}

  // 1. قراءة بيانات صنف رخصة محدد بواسطة الـ ID الخاص به
  getLicenseClass(ID: number): Observable<LicenseClass> {
    // ✅ تصحيح طريقة استدعاء الدالة الديناميكية من ملف الـ Endpoints المحدث وتأمينها
    return this.http.get<LicenseClass>(LICENSE_CLASS_API_ENDPOINT.read(ID)).pipe(
      catchError((error) => {
        if (error.status === 404) {
          return throwError(() => new Error(`License Class with ID ${ID} NOT Found`));
        }
        return throwError(() => new Error(error.message || 'An unexpected error occurred.'));
      })
    );
  }

  // 2. جلب القائمة الكاملة لجميع أصناف الرخص المتوفرة في النظام
  getAllClasses(): Observable<LicenseClass[]> {
    return this.http.get<LicenseClass[]>(LICENSE_CLASS_API_ENDPOINT.allClasses).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching license classes list'));
      })
    );
  }

  // 3. جلب قائمة أسماء أصناف الرخص فقط (مطابقة لدالة ClassesName في الـ Controller)
  getClassesNames(): Observable<string[]> {
    return this.http.get<string[]>(LICENSE_CLASS_API_ENDPOINT.classesNames).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching license classes names'));
      })
    );
  }

  // 4. إنشاء صنف رخصة جديد
  create(newClass: LicenseClass): Observable<LicenseClass> {
    return this.http.post<LicenseClass>(LICENSE_CLASS_API_ENDPOINT.create, newClass).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error creating license class'));
      })
    );
  }

  // 5. تحديث بيانات صنف رخصة موجود
  update(id: number, updatedClass: LicenseClass): Observable<LicenseClass> {
    return this.http.put<LicenseClass>(LICENSE_CLASS_API_ENDPOINT.update(id), updatedClass).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error updating license class'));
      })
    );
  }

  // 6. حذف صنف رخصة من النظام
  delete(id: number): Observable<any> {
    return this.http.delete<any>(LICENSE_CLASS_API_ENDPOINT.delete(id)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error deleting license class'));
      })
    );
  }
}