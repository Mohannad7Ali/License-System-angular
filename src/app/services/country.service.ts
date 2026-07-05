555555555555555555555555555555555555555555555555555555555555555// import { HttpClient } from '@angular/common/http';
// import { Injectable } from '@angular/core';
// import { COUNTRY_API_ENDPOINT } from '../environments/endpoints/country.endpoint';
// import { Observable, tap } from 'rxjs';

// @Injectable({
//   providedIn: 'root',
// })
// export class CountryService {
//   constructor(private http: HttpClient) {}

//   AllCountries(): Observable<string[]> {
//     return this.http.get<string[]>(COUNTRY_API_ENDPOINT.allCountries);
//   }
// }
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { COUNTRY_API_ENDPOINT } from '../environments/endpoints/country.endpoint'; // تأكد من مطابقة اسم الملف لديك
import { catchError, Observable, throwError } from 'rxjs';
import { Country } from '../models/country.model';

@Injectable({
  providedIn: 'root',
})
export class CountryService {
  constructor(private http: HttpClient) {}

  // جلب جميع الدول من السيرفر
  AllCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(COUNTRY_API_ENDPOINT.allCountries).pipe(
      catchError((error) => {
        // ✅ إضافة معالجة الأخطاء الآمنة دون المساس بنوع المخرجات المتوقع
        return throwError(() => new Error(error.message || 'Error fetching countries'));
      })
    );
  }
}