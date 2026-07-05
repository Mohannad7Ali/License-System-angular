// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { USER_API_ENDPOINTS } from '../environments/endpoints/user.endpoints';
// import { User } from '../models/user.model';
// import { catchError, Observable, throwError } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class UserService {
//   constructor(private httpClient: HttpClient) {}
//   all(): Observable<User[]> {
//     return this.httpClient.get<User[]>(USER_API_ENDPOINTS.all).pipe(
//       catchError((error) => {
//         return throwError(() => new Error(error.message));
//       })
//     );
//   }
//   // readUser(username: string) {
//   //   return this.httpClient.get<User>(
//   //     `${USER_API_ENDPOINTS.readByUsername}${username}`
//   //   );
//   // }
//   readUser(username: string): Observable<User> {
//     // استدعاء الدالة المحدثة من الـ Endpoints وتمرير اسم المستخدم لها بشكل نظيف
//     return this.httpClient.get<User>(
//       USER_API_ENDPOINTS.readByUsername(username)
//     ).pipe(
//       catchError((error) => {
//         return throwError(() => new Error(error.message));
//       })
//     );
//   }

//   delete(id: number): Observable<boolean> {
//     return this.httpClient
//       .delete<boolean>(`${USER_API_ENDPOINTS.delete}${id}`)
//       .pipe(
//         catchError((error) => {
//           return throwError(() => new Error(error.message));
//         })
//       );
//   }
// }

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { USER_API_ENDPOINTS } from '../environments/endpoints/user.endpoints'; // تأكد من مطابقة اسم ملف الـ endpoints لديك
import { User } from '../models/user.model';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private httpClient: HttpClient) {}

  // 1. جلب قائمة العرض لجميع المستخدمين بداخل النظام
  all(): Observable<User[]> {
    return this.httpClient.get<User[]>(USER_API_ENDPOINTS.all).pipe(
      catchError((error) => {
        return throwError(
          () => new Error(error.message || 'فشل جلب قائمة المستخدمين'),
        );
      }),
    );
  }

  // 2. دالتك الأصلية لقراءة بيانات مستخدم محدد بواسطة اسم المستخدم (Username)
  readUser(username: string): Observable<User> {
    return this.httpClient
      .get<User>(USER_API_ENDPOINTS.readByUsername(username))
      .pipe(
        catchError((error) => {
          return throwError(
            () =>
              new Error(
                error.message ||
                  `Error fetching user with username ${username}`,
              ),
          );
        }),
      );
  }

  // 3. حذف حساب مستخدم من النظام بواسطة الـ ID
  delete(id: number): Observable<boolean> {
    // ✅ تصحيح استدعاء الدالة الديناميكية للـ Endpoint بدلاً من الدمج النصي اليدوي
    return this.httpClient.delete<boolean>(USER_API_ENDPOINTS.delete(id)).pipe(
      catchError((error) => {
        return throwError(
          () => new Error(error.message || 'خطأ في حذف المستخدم'),
        );
      }),
    );
  }

  // ==========================================
  // 🚀 الدوال الإضافية للمطابقة الـهندسية الكاملة 100% مع الـ Controller
  // ==========================================

  // 4. قراءة بيانات مستخدم محدد بواسطة الـ ID (مطابق لدالة Read الـ Int بالسيرفر)
  read(id: number): Observable<User> {
    return this.httpClient.get<User>(USER_API_ENDPOINTS.read(id)).pipe(
      catchError((error) => {
        if (error.status === 404) {
          return throwError(() => new Error(`User with ID ${id} NOT Found`));
        }
        return throwError(
          () => new Error(error.message || 'An unexpected error occurred.'),
        );
      }),
    );
  }

  // 5. إنشاء حساب مستخدم جديد بالنظام
  create(newUser: User): Observable<User> {
    return this.httpClient.post<User>(USER_API_ENDPOINTS.create, newUser).pipe(
      catchError((error) => {
        return throwError(
          () => new Error(error.message || 'Error creating user'),
        );
      }),
    );
  }

  // 6. تحديث بيانات حساب مستخدم موجود مسبقاً
  update(id: number, updatedUser: User): Observable<User> {
    return this.httpClient
      .put<User>(USER_API_ENDPOINTS.update(id), updatedUser)
      .pipe(
        catchError((error) => {
          return throwError(
            () => new Error(error.message || 'Error updating user'),
          );
        }),
      );
  }

  // 7. التحقق من وجود مستخدم في قاعدة البيانات بواسطة الـ ID
  isExist(id: number): Observable<boolean> {
    return this.httpClient.get<boolean>(USER_API_ENDPOINTS.isExist(id)).pipe(
      catchError((error) => {
        return throwError(
          () => new Error(error.message || 'Error checking user existence'),
        );
      }),
    );
  }
}
