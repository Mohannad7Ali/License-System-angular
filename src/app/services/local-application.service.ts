// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import {
//   LocalApplication,
//   LocalApplicationView,
// } from '../models/local-application.model';
// import { LOCAL_APPLICATION_API_ENDPOINT } from '../environments/endpoints/local-application.endpoints';
// import { catchError, map, Observable, tap, throwError } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class LocalApplicationService {
//   constructor(private http: HttpClient) {}

//   create(new_application: LocalApplication): Observable<LocalApplication> {
//     return this.http.post<LocalApplication>(
//       LOCAL_APPLICATION_API_ENDPOINT.create,
//       new_application
//     );
//   }

//   getAll(): Observable<LocalApplicationView[]> {
//     return this.http.get<LocalApplicationView[]>(
//       LOCAL_APPLICATION_API_ENDPOINT.all
//     );
//   }

//   read(ID: number): Observable<LocalApplication> {
//     return this.http
//       .get<LocalApplication>(`${LOCAL_APPLICATION_API_ENDPOINT.read}${ID}`)
//       .pipe(
//         catchError((error) => {
//           if (error.status === 404) {
//             // Emit a specific error message for 404
//             return throwError(
//               () => new Error(`Application with ID ${ID} NOT Found`)
//             );
//           }
//           // Handle other errors
//           return throwError(() => new Error('An unexpected error occurred.'));
//         })
//       );
//   }
//   readView(ID: number): Observable<LocalApplicationView> {
//     return this.http
//       .get<LocalApplicationView>(LOCAL_APPLICATION_API_ENDPOINT.readView(ID))
//       .pipe(
//         catchError((error) => {
//           if (error.status === 404) {
//             // Emit a specific error message for 404
//             return throwError(
//               () => new Error(`Application with ID ${ID} NOT Found`)
//             );
//           }
//           // Handle other errors
//           return throwError(() => new Error('An unexpected error occurred.'));
//         }),
//         map((response) => {
//           return response;
//         })
//       );
//   }

//   passedTestCount(id: number): Observable<number> {
//     return this.http.get<number>(
//       LOCAL_APPLICATION_API_ENDPOINT.passedTestCount(id)
//     );
//   }

//   isLicenseIssued(id: number): Observable<boolean> {
//     return this.http
//       .get<boolean>(LOCAL_APPLICATION_API_ENDPOINT.isLicenseIssued(id))
//       .pipe(
//         catchError((error) => {
//           return throwError(() => new Error(error));
//         })
//       );
//   }
//   isTestAttended(id: number, testID: number): Observable<boolean> {
//     return this.http.get<boolean>(
//       LOCAL_APPLICATION_API_ENDPOINT.isTestAttended(id, testID)
//     );
//   }

//   cancel(id: number): Observable<boolean> {
//     return this.http
//       .patch<boolean>(LOCAL_APPLICATION_API_ENDPOINT.cancel(id), {})
//       .pipe(
//         catchError((error) => {
//           return throwError(() => new Error(error));
//         })
//       );
//   }

//   issueLicenseFisrTime(
//     id: number,
//     userid: number,
//     notes: string | null
//   ): Observable<number> {
//     return this.http
//       .get<number>(
//         LOCAL_APPLICATION_API_ENDPOINT.issueLicense(id, notes, userid)
//       )
//       .pipe(
//         catchError((error) => {
//           return throwError(() => new Error(error.message));
//         })
//       );
//   }

//   licenseID(id: number): Observable<number> {
//     return this.http
//       .get<number>(LOCAL_APPLICATION_API_ENDPOINT.licenseID(id))
//       .pipe(
//         catchError((error) => {
//           return throwError(() => new Error(error.message));
//         })
//       );
//   }

//   personID(id: number): Observable<number> {
//     return this.http
//       .get<number>(LOCAL_APPLICATION_API_ENDPOINT.readPersonID(id))
//       .pipe(
//         catchError((error) => {
//           return throwError(() => new Error(error.message));
//         })
//       );
//   }
// }

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import {
  LocalApplication,
  LocalApplicationView,
} from '../models/local-application.model';
import { LOCAL_APPLICATION_API_ENDPOINT } from '../environments/endpoints/local-application.endpoints';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LocalApplicationService {
  constructor(private http: HttpClient) {}

  // 1. إنشاء طلب رخصة محلية جديد
  create(new_application: LocalApplication): Observable<LocalApplication> {
    return this.http.post<LocalApplication>(
      LOCAL_APPLICATION_API_ENDPOINT.create,
      new_application
    ).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error creating local application'));
      })
    );
  }

  // 2. جلب قائمة العرض الكاملة لجميع الطلبات المحلية
  getAll(): Observable<LocalApplicationView[]> {
    return this.http.get<LocalApplicationView[]>(
      LOCAL_APPLICATION_API_ENDPOINT.all
    ).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching local applications list'));
      })
    );
  }

  // 3. قراءة بيانات طلب رخصة محدد بواسطة الـ ID
  read(ID: number): Observable<LocalApplication> {
    // ✅ تصحيح طريقة استدعاء الدالة الديناميكية لملف الـ Endpoints المحدث
    return this.http
      .get<LocalApplication>(LOCAL_APPLICATION_API_ENDPOINT.read(ID))
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            return throwError(() => new Error(`Application with ID ${ID} NOT Found`));
          }
          return throwError(() => new Error(error.message || 'An unexpected error occurred.'));
        })
      );
  }

  // 4. قراءة تفاصيل العرض لطلب محدد (View DTO)
  readView(ID: number): Observable<LocalApplicationView> {
    return this.http
      .get<LocalApplicationView>(LOCAL_APPLICATION_API_ENDPOINT.readView(ID))
      .pipe(
        catchError((error) => {
          if (error.status === 404) {
            return throwError(() => new Error(`Application with ID ${ID} NOT Found`));
          }
          return throwError(() => new Error(error.message || 'An unexpected error occurred.'));
        }),
        map((response) => response)
      );
  }

  // 5. جلب عدد الاختبارات الناجحة للطلب
  passedTestCount(id: number): Observable<number> {
    return this.http.get<number>(
      LOCAL_APPLICATION_API_ENDPOINT.passedTestCount(id)
    ).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching passed tests count'));
      })
    );
  }

  // 6. التحقق هل تم إصدار رخصة قيادة لهذا الطلب أم لا
  isLicenseIssued(id: number): Observable<boolean> {
    return this.http
      .get<boolean>(LOCAL_APPLICATION_API_ENDPOINT.isLicenseIssued(id))
      .pipe(
        catchError((error) => {
          // ✅ تصحيح تمرير نص الخطأ بدلاً من الكائن كاملاً
          return throwError(() => new Error(error.message || 'An error occurred checking license status.'));
        })
      );
  }

  // 7. التحقق هل حضر المستخدم اختباراً معيناً أم لا
  isTestAttended(id: number, testID: number): Observable<boolean> {
    return this.http.get<boolean>(
      LOCAL_APPLICATION_API_ENDPOINT.isTestAttended(id, testID)
    ).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error checking test attendance status'));
      })
    );
  }

  // 8. إلغاء طلب رخصة القيادة المحلية
  cancel(id: number): Observable<boolean> {
    return this.http
      .patch<boolean>(LOCAL_APPLICATION_API_ENDPOINT.cancel(id), {})
      .pipe(
        catchError((error) => {
          // ✅ تصحيح تمرير نص الخطأ بدلاً من الكائن كاملاً
          return throwError(() => new Error(error.message || 'Error cancelling the application'));
        })
      );
  }

  // 9. إصدار رخصة القيادة للمرة الأولى بعد اجتياز الفحوصات
  issueLicenseFisrTime(
    id: number,
    userid: number,
    notes: string | null
  ): Observable<number> {
    return this.http
      .get<number>(
        // ✅ ضبط تمرير المعاملات بالترتيب الصحيح المتوقع في الـ Endpoint والسيرفر
        LOCAL_APPLICATION_API_ENDPOINT.issueLicense(id, notes, userid)
      )
      .pipe(
        catchError((error) => {
          return throwError(() => new Error(error.message || 'Error issuing license'));
        })
      );
  }

  // 10. جلب معرف الرخصة المرتبطة بالطلب
  licenseID(id: number): Observable<number> {
    return this.http
      .get<number>(LOCAL_APPLICATION_API_ENDPOINT.licenseID(id))
      .pipe(
        catchError((error) => {
          return throwError(() => new Error(error.message || 'Error fetching associated license ID'));
        })
      );
  }

  // 11. جلب معرف الشخص صاحب الطلب
  personID(id: number): Observable<number> {
    return this.http
      .get<number>(LOCAL_APPLICATION_API_ENDPOINT.readPersonID(id))
      .pipe(
        catchError((error) => {
          return throwError(() => new Error(error.message || 'Error fetching person ID'));
        })
      );
  }

  // ==========================================
  // 🚀 الدوال الإضافية للمطابقة الـهندسية الكاملة 100% مع الـ Controller
  // ==========================================

  // 12. تحديث بيانات طلب رخصة قيادة محلية
  update(id: number, updatedApp: LocalApplication): Observable<LocalApplication> {
    return this.http.put<LocalApplication>(LOCAL_APPLICATION_API_ENDPOINT.update(id), updatedApp).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error updating local application'));
      })
    );
  }

  // 13. حذف طلب رخصة محلية من النظام
  delete(id: number): Observable<any> {
    return this.http.delete<any>(LOCAL_APPLICATION_API_ENDPOINT.delete(id)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error deleting local application'));
      })
    );
  }

  // 14. التحقق هل اجتاز المتقدم جميع الاختبارات الثلاثة بنجاح
  isAllTestsPassed(id: number): Observable<boolean> {
    return this.http.get<boolean>(LOCAL_APPLICATION_API_ENDPOINT.isAllTestsPassed(id)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error checking all tests status'));
      })
    );
  }

  // 15. التحقق هل نجح المتقدم في نوع اختبار معين
  isTestPassed(id: number, testType: number): Observable<boolean> {
    return this.http.get<boolean>(LOCAL_APPLICATION_API_ENDPOINT.isTestPassed(id, testType)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error checking specific test status'));
      })
    );
  }

  // 16. التحقق هل الطلب ملغي حالياً
  isCancelled(id: number): Observable<boolean> {
    return this.http.get<boolean>(LOCAL_APPLICATION_API_ENDPOINT.isCancelled(id)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error checking cancellation status'));
      })
    );
  }

  // 17. التحقق هل تم اكتمال الطلب بنجاح
  isCompleted(id: number): Observable<boolean> {
    return this.http.get<boolean>(LOCAL_APPLICATION_API_ENDPOINT.isCompleted(id)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error checking completion status'));
      })
    );
  }

  // 18. جلب معرف الرخصة النشطة المرتبطة بالمتقدم
  activeLicenseID(id: number): Observable<number> {
    return this.http.get<number>(LOCAL_APPLICATION_API_ENDPOINT.activeLicenseID(id)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching active license ID'));
      })
    );
  }

  // 19. جلب تفاصيل آخر اختبار تم تقديمه لنوع فحص محدد
  lastTestPerTestType(id: number, testId: number): Observable<any> {
    return this.http.get<any>(LOCAL_APPLICATION_API_ENDPOINT.lastTestPerTestType(id, testId)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error fetching last test details'));
      })
    );
  }

  // 20. تحويل حالة الطلب يدوياً إلى مكتمل (HttpPatch)
  complete(id: number): Observable<boolean> {
    return this.http.patch<boolean>(LOCAL_APPLICATION_API_ENDPOINT.complete(id), {}).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error completing application'));
      })
    );
  }
}