import { Routes } from '@angular/router';
import { new_applications_routes } from './new-applications.routes';

export const services_routes: Routes = [
  {
    path: 'new-application',
    loadChildren: () =>
      import('./new-applications.routes').then(
        (module) => module.new_applications_routes,
      ),
  },
  {
    path: 'new-international-license',
    loadChildren: () =>
      import('./new-applications.routes').then(
        (module) => module.new_applications_routes,
      ),
  },
  {
    path: 'renew-local-app',
    loadComponent: () =>
      import('../dashboard/services/renew-local-application/renew-local-application.component').then(
        (module) => module.RenewLocalApplicationComponent,
      ),
  },
  {
    path: 'replace-app',
    loadComponent: () =>
      import('../dashboard/services/replace-application/replace-application.component').then(
        (module) => module.ReplaceApplicationComponent,
      ),
  },
  {
    path: 'release-app',
    loadComponent: () =>
      import('../dashboard/services/release-application/release-application.component').then(
        (module) => module.ReleaseApplicationComponent,
      ),
  },
  {
    path: 'detain-license', // ✅ إضافة مسار حجز الرخصة الجديد
    loadComponent: () =>
      import('../dashboard/services/detain-license/detain-license.component').then(
        (module) => module.DetainLicenseComponent,
      ),
  },
];
