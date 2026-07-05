import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { ApplicationType } from '../models/application-type.model';
import { APPLICATION_TYPE_API_ENDPOINT } from '../environments/endpoints/application-type.endpoints';

@Injectable({ providedIn: 'root' })
export class ApplicationTypesService {
  private http = inject(HttpClient);

  all(): Observable<ApplicationType[]> {
    return this.http
      .get<ApplicationType[]>(APPLICATION_TYPE_API_ENDPOINT.all)
      .pipe(
        catchError((err) =>
          throwError(() => new Error('حدث خطأ أثناء جلب البيانات')),
        ),
      );
  }

  getById(id: number): Observable<ApplicationType> {
    return this.http.get<ApplicationType>(
      APPLICATION_TYPE_API_ENDPOINT.read(id),
    );
  }

  add(type: ApplicationType): Observable<ApplicationType> {
    return this.http.post<ApplicationType>(
      APPLICATION_TYPE_API_ENDPOINT.create,
      type,
    );
  }

  update(id: number, type: ApplicationType): Observable<ApplicationType> {
    return this.http.put<ApplicationType>(
      APPLICATION_TYPE_API_ENDPOINT.update(id),
      type,
    );
  }

  delete(id: number): Observable<boolean> {
    return this.http.delete<boolean>(APPLICATION_TYPE_API_ENDPOINT.delete(id));
  }
}
