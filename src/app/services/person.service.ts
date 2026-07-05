import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PERSON_API_ENDPOINTS } from '../environments/endpoints/person.endpoints';
import { catchError, Observable, throwError } from 'rxjs';
import { Person } from '../models/person.model';

@Injectable({
  providedIn: 'root',
})
export class PersonService {
  constructor(private http: HttpClient) {}

  // ✅ جلب جميع الأشخاص (تمت إضافتها وتأمين معالجة الأخطاء لها)
  all(): Observable<Person[]> {
    return this.http.get<Person[]>(PERSON_API_ENDPOINTS.all).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message));
      }),
    );
  }

  isNationalNoExist(national_no: string): Observable<boolean> {
    return this.http
      .get<boolean>(PERSON_API_ENDPOINTS.isExistNationalNo(national_no))
      .pipe(
        catchError((error) => {
          return throwError(() => new Error(error.message));
        }),
      );
  }

  create(new_person: Person): Observable<Person> {
    return this.http.post<Person>(PERSON_API_ENDPOINTS.create, new_person).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message));
      }),
    );
  }

  read(ID: number): Observable<Person> {
    return this.http.get<Person>(PERSON_API_ENDPOINTS.read(ID)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message));
      }),
    );
  }

  update(id: number, updated_person: Person): Observable<Person> {
    return this.http
      .put<Person>(PERSON_API_ENDPOINTS.update(id), updated_person)
      .pipe(
        catchError((error) => {
          return throwError(() => new Error(error.message));
        }),
      );
  }

  getFullName(ID: number): Observable<string> {
    return this.http
      .get<string>(PERSON_API_ENDPOINTS.fullName(ID), {
        responseType: 'text' as 'json',
      })
      .pipe(
        catchError((error) => {
          return throwError(() => new Error(error.message));
        }),
      );
  }

  malePercentage(): Observable<number> {
    return this.http.get<number>(PERSON_API_ENDPOINTS.male_percentage).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message));
      }),
    );
  }

  femalePercentage(): Observable<number> {
    return this.http.get<number>(PERSON_API_ENDPOINTS.female_percentage).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message));
      }),
    );
  }
  delete(id: number): Observable<void> {
    return this.http.delete<void>(PERSON_API_ENDPOINTS.delete(id)).pipe(
      catchError((error) => {
        return throwError(() => new Error(error.message));
      }),
    );
  }
}
