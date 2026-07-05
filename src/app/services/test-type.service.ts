// import { Injectable } from '@angular/core';
// import { HttpClient } from '@angular/common/http';
// import { catchError, Observable, tap, throwError } from 'rxjs';
// import { TEST_TYPE_API_ENDPOINT } from '../environments/endpoints/test-type.endpoints';
// import { TestType } from '../models/test-type.model';

// @Injectable({
//   providedIn: 'root',
// })
// export class TestTypesService {
//   constructor(private http: HttpClient) {}

//   get(id: number): Observable<TestType> {
//     return this.http.get<TestType>(`${TEST_TYPE_API_ENDPOINT.read}${id}`).pipe(
//       catchError((error) => {
//         return throwError(() => new Error(error.message));
//       })
//     );
//   }
//   add(new_test: TestType): Observable<TestType> {
//     return this.http.post<TestType>(TEST_TYPE_API_ENDPOINT.add, new_test).pipe(
//       catchError((error) => {
//         return throwError(() => new Error(error.messages));
//       })
//     );
//   }

//   update(id: number, updated_type: TestType): Observable<TestType> {
//     return this.http
//       .put<TestType>(`${TEST_TYPE_API_ENDPOINT.update}${id}`, updated_type)
//       .pipe(
//         catchError((error) => {
//           return throwError(() => new Error(error.messages));
//         })
//       );
//   }
//   all(): Observable<TestType[]> {
//     return this.http.get<TestType[]>(TEST_TYPE_API_ENDPOINT.all);
//   }
//   getFees(type_id: number) {
//     return this.http.get<Observable<number>>(
//       TEST_TYPE_API_ENDPOINT.fee(type_id)
//     );
//   }

//   delete(id: number) {
//     return this.http.delete(`${TEST_TYPE_API_ENDPOINT.delete}${id}`).pipe(
//       catchError((error) => {
//         return throwError(() => new Error(error.messages));
//       })
//     );
//   }
// }
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { TEST_TYPE_API_ENDPOINT } from '../environments/endpoints/test-type.endpoints';
import { TestType } from '../models/test-type.model';

@Injectable({
  providedIn: 'root',
})
export class TestTypesService {
  constructor(private http: HttpClient) {}

  // 1. قراءة بيانات نوع اختبار محدد بواسطة الـ ID
  get(id: number): Observable<TestType> {
    // ✅ تصحيح استدعاء الدالة الديناميكية للـ Endpoint من ملف التكوين المحدث
    return this.http.get<TestType>(TEST_TYPE_API_ENDPOINT.read(id)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching test type'));
      })
    );
  }

  // 2. إنشاء نوع اختبار جديد
  add(new_test: TestType): Observable<TestType> {
    return this.http.post<TestType>(TEST_TYPE_API_ENDPOINT.add, new_test).pipe(
      catchError((error) => {
        // ✅ تصحيح الاسم الإملائي للخاصية من error.messages إلى error.message
        return throwError(() => new Error(error.message || 'Error adding new test type'));
      })
    );
  }

  // 3. تحديث بيانات نوع اختبار موجود في النظام
  update(id: number, updated_type: TestType): Observable<TestType> {
    // ✅ تصحيح استدعاء الدالة الديناميكية للـ Endpoint لمنع أخطاء الروابط المدمجة يدوياً
    return this.http
      .put<TestType>(TEST_TYPE_API_ENDPOINT.update(id), updated_type)
      .pipe(
        catchError((error) => {
          // ✅ تصحيح الاسم الإملائي للخاصية إلى error.message
          return throwError(() => new Error(error.message || 'Error updating test type'));
        })
      );
  }

  // 4. جلب القائمة الكاملة لجميع أنواع الاختبارات
  all(): Observable<TestType[]> {
    return this.http.get<TestType[]>(TEST_TYPE_API_ENDPOINT.all).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching all test types'));
      })
    );
  }

  // 5. دالتك الأصلية لجلب التكلفة المادية للاختبار مع تصحيح الـ Type الخاص بها
  getFees(type_id: number): Observable<number> {
    // ✅ تصحيح التوقيع ليعيد القيمة مباشرة منعاً لتداخل الـ Observables
    return this.http.get<number>(TEST_TYPE_API_ENDPOINT.fee(type_id)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching test type fees'));
      })
    );
  }

  // 6. حذف نوع اختبار من النظام بواسطة الـ ID
  delete(id: number): Observable<boolean> {
    // ✅ تصحيح استدعاء الدالة الديناميكية وتعيين نوع الإرجاع المتوافق مع السيرفر <boolean>
    return this.http.delete<boolean>(TEST_TYPE_API_ENDPOINT.delete(id)).pipe(
      catchError((error) => {
        // ✅ تصحيح الاسم الإملائي للخاصية إلى error.message
        return throwError(() => new Error(error.message || 'Error deleting test type'));
      })
    );
  }

  // ==========================================
  // 🚀 دالة الإضافة والتوافق الكامل والمباشر مع الـ Controller
  // ==========================================
  
  // 7. جلب سعر نوع الاختبار (مطابقة دقيقة لاسم دالة GetPaidFees بالسيرفر)
  getPaidFees(id: number): Observable<number> {
    return this.http.get<number>(TEST_TYPE_API_ENDPOINT.fee(id)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching test type fees'));
      })
    );
  }
}
