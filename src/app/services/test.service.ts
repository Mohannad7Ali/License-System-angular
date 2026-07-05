// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { catchError, map, Observable, tap, throwError } from 'rxjs';
// import { Test } from '../models/test.model';
// import { TESTS_API_ENDPOINTS } from '../environments/endpoints/test.endpoints';

// @Injectable({
//   providedIn: 'root',
// })
// export class TestService {
//   constructor(private http: HttpClient) {}
//   read(id: number): Observable<Test> {
//     return this.http.get<Test>(TESTS_API_ENDPOINTS.read(id)).pipe(
//       catchError((error) => throwError(() => new Error(error.message))),
//       map((response) => {
//         return response;
//       })
//     );
//   }
//   create(new_test: Test): Observable<Test> {
//     return this.http.post<Test>(TESTS_API_ENDPOINTS.add, new_test).pipe(
//       catchError((error) => throwError(() => new Error(error.message))),
//       map((response) => {
//         return response;
//       })
//     );
//   }
//   all(): Observable<Test[]> {
//     return this.http.get<Test[]>(TESTS_API_ENDPOINTS.all);
//   }

//   count(): Observable<number> {
//     return this.http.get<number>(TESTS_API_ENDPOINTS.count);
//   }

//   failedPercentage(): Observable<number> {
//     return this.http.get<number>(TESTS_API_ENDPOINTS.faieldPercentage);
//   }
//   passedPercentage(): Observable<number> {
//     return this.http.get<number>(TESTS_API_ENDPOINTS.passedPercentage);
//   }

//   // getFees(type_id: number) {
//   //   return this.http.get<Observable<number>>(TEST_TYPE_API_ENDPOINT.fee(type_id));
//   // }

//   // getApplicationTypeById(id: number): Observable<ApplicationType> {
//   //   return this.http.get<ApplicationType>(`${this.apiUrl}/${id}`);
//   // }
// }

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';
import { Test } from '../models/test.model';
import { TESTS_API_ENDPOINTS } from '../environments/endpoints/test.endpoints'; // تأكد من مطابقة اسم ملف الـ endpoints لديك

@Injectable({
  providedIn: 'root',
})
export class TestService {
  constructor(private http: HttpClient) {}

  // 1. قراءة سجل فحص محدد بواسطة الـ ID
  read(id: number): Observable<Test> {
    return this.http.get<Test>(TESTS_API_ENDPOINTS.read(id)).pipe(
      catchError((error) => throwError(() => new Error(error.message || 'Error fetching test record'))),
      map((response) => response)
    );
  }

  // 2. إنشاء سجل فحص جديد (حفظ نتيجة اختبار)
  create(new_test: Test): Observable<Test> {
    return this.http.post<Test>(TESTS_API_ENDPOINTS.add, new_test).pipe(
      catchError((error) => throwError(() => new Error(error.message || 'Error creating test record'))),
      map((response) => response)
    );
  }

  // 3. جلب جميع سجلات الفحوصات والاختبارات
  all(): Observable<Test[]> {
    return this.http.get<Test[]>(TESTS_API_ENDPOINTS.all).pipe(
      catchError((error) => throwError(() => new Error(error.message || 'Error fetching all tests list')))
    );
  }

  // 4. جلب العدد الإجمالي للاختبارات بداخل النظام
  count(): Observable<number> {
    return this.http.get<number>(TESTS_API_ENDPOINTS.count).pipe(
      catchError((error) => throwError(() => new Error(error.message || 'Error fetching tests count')))
    );
  }

  // 5. جلب نسبة أو عدد الاختبارات الراسبة
  failedPercentage(): Observable<number> {
    // ✅ تصحيح اسم الخاصية المستدعاة من ملف الـ Endpoints لتطابق الباك إند
    return this.http.get<number>(TESTS_API_ENDPOINTS.failedPercentage).pipe(
      catchError((error) => throwError(() => new Error(error.message || 'Error fetching failed percentage')))
    );
  }

  // 6. جلب نسبة أو عدد الاختبارات الناجحة
  passedPercentage(): Observable<number> {
    return this.http.get<number>(TESTS_API_ENDPOINTS.passedPercentage).pipe(
      catchError((error) => throwError(() => new Error(error.message || 'Error fetching passed percentage')))
    );
  }

  // ==========================================
  // 🚀 الدوال الإضافية للمطابقة الـهندسية الكاملة 100% مع الـ Controller
  // ==========================================

  // 7. الاستعلام عن فحص محدد بواسطة (الشخص - نوع الفحص - صنف الرخصة) بالترتيب المعتمد بالسيرفر
  findByPersonAndLicenseClass(personId: number, testTypeId: number, licenseClassId: number): Observable<Test> {
    return this.http.get<Test>(TESTS_API_ENDPOINTS.readByPersonAndLicenseClass(personId, testTypeId, licenseClassId)).pipe(
      catchError((error) => {
        if (error.status === 404) {
          return throwError(() => new Error('No test record found matching these specifications.'));
        }
        return throwError(() => new Error(error.message || 'Error querying test record'));
      })
    );
  }

  // 8. تحديث بيانات سجل اختبار موجود مسبقاً
  update(id: number, updatedTest: Test): Observable<Test> {
    return this.http.put<Test>(TESTS_API_ENDPOINTS.update(id), updatedTest).pipe(
      catchError((error) => throwError(() => new Error(error.message || 'Error updating test record')))
    );
  }

  // 9. حذف سجل اختبار من النظام
  delete(id: number): Observable<any> {
    return this.http.delete<any>(TESTS_API_ENDPOINTS.delete(id)).pipe(
      catchError((error) => throwError(() => new Error(error.message || 'Error deleting test record')))
    );
  }
}