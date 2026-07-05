// import { Injectable } from '@angular/core';
// import { LOGIN_API_ENDPOINTS } from '../environments/endpoints/login.endpoints';
// import { HttpClient, HttpParams } from '@angular/common/http';
// import { BehaviorSubject, catchError, map, Observable, of, tap } from 'rxjs';
// @Injectable({
//   providedIn: 'root',
// })
// export class LoginService {
//   constructor(private httpClient: HttpClient) {}

//   //check if entered username is unique for firsttime register
//   isExist(username: string): Observable<boolean> {
//     return (
//       this.httpClient
//         .get<{ exist: boolean }>(LOGIN_API_ENDPOINTS.isUsernameExist(username))
//         // Return true if the username exists
//         .pipe(map((response) => response.exist))
//     );
//   }

//   //check if username and passowrd BOTH match database
//   isCorrect(username: string, password: string): Observable<boolean> {
//     return this.httpClient.get<boolean>(
//       `${LOGIN_API_ENDPOINTS.isCorrect(username, password)}`
//     );
//   }

//   //check if entered user is active
//   isActive(username: string, password: string): Observable<boolean> {
//     return this.httpClient.get<boolean>(
//       `${LOGIN_API_ENDPOINTS.isUserActive(username, password)}`
//     );
//   }
//   //save login record in database
//   saveLogin(userID: number) {
//     return this.httpClient.post(
//       `${LOGIN_API_ENDPOINTS.saveLogin}${userID}`,
//       {}
//     );
//   }
// }

import { Injectable } from '@angular/core';
import { LOGIN_API_ENDPOINTS } from '../environments/endpoints/login.endpoints'; // تأكد من مطابقة اسم ملف الـ endpoints
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(private httpClient: HttpClient) {}

  // 1. التحقق إذا كان اسم المستخدم موجوداً مسبقاً في النظام (عند التسجيل لأول مرة)
  isExist(username: string): Observable<boolean> {
    return this.httpClient
      // ✅ تعديل الـ Type ليتوافق مع الـ bool المباشر القادم من الـ Controller
      .get<boolean>(LOGIN_API_ENDPOINTS.isUsernameExist(username))
      .pipe(
        map((response) => response),
        catchError((error) => {
          return throwError(() => new Error(error.message || 'Error checking username existence'));
        })
      );
  }

  // 2. التحقق من تطابق اسم المستخدم وكلمة المرور مع قاعدة البيانات
  isCorrect(username: string, password: string): Observable<boolean> {
    // ✅ إزالة الـ Template Literals الزائدة واستدعاء دالة الـ Endpoint مباشرة وتأمينها
    return this.httpClient.get<boolean>(LOGIN_API_ENDPOINTS.isCorrect(username, password)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error authenticating user credentials'));
      })
    );
  }

  // 3. التحقق إذا كان حساب المستخدم نشطاً في النظام ومصرحاً له بالدخول
  isActive(username: string, password: string): Observable<boolean> {
    // ✅ إزالة الـ Template Literals الزائدة واستدعاء دالة الـ Endpoint مباشرة وتأمينها
    return this.httpClient.get<boolean>(LOGIN_API_ENDPOINTS.isUserActive(username, password)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error checking user activation status'));
      })
    );
  }

  // 4. تسجيل وحفظ سجل جلسة الدخول في قاعدة البيانات (Login Register)
  saveLogin(userID: number): Observable<any> {
    // ✅ تصحيح طريقة استدعاء الدالة الديناميكية المحدثة من ملف الـ Endpoints
    return this.httpClient.post<any>(LOGIN_API_ENDPOINTS.saveLogin(userID), {}).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message || 'Error saving login record'));
      })
    );
  }
}