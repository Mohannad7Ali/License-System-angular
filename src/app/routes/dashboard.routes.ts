import { Routes } from '@angular/router';
import { TestComponent } from '../dashboard/test/test.component';

export const dashboard_routes: Routes = [
  {
    path: '',
    redirectTo: 'test',
    pathMatch: 'full',
  },
  {
    path: 'test',
    component: TestComponent,
  },
  {
    path: 'user-account',
    loadChildren: () =>
      import('./user-account.routes').then((mod) => mod.user_account_routes),
  },
  {
    path: 'accounts/add',
    loadComponent: () =>
      import('../dashboard/accounts/add-edit-user/add-edit-user.component').then(
        (m) => m.AddEditUserComponent,
      ),
  },
  {
    path: 'accounts/edit/:id',
    loadComponent: () =>
      import('../dashboard/accounts/add-edit-user/add-edit-user.component').then(
        (m) => m.AddEditUserComponent,
      ),
  },
  {
    path: 'services',
    loadChildren: () =>
      import('./services.routes').then((mod) => mod.services_routes),
  },
  {
    path: 'manage-tests',
    loadChildren: () =>
      import('./tests-management.route').then(
        (mod) => mod.test_management_routes,
      ),
  },
  {
    path: 'applications-management',
    loadChildren: () =>
      import('./application-management.routes').then(
        (mod) => mod.app_management_routes,
      ),
  },
  {
    path: 'licenses-management',
    loadChildren: () =>
      import('./licenses-management.routes').then(
        (mod) => mod.licenses_management_routes,
      ),
  },
  {
    path: 'appointments',
    loadChildren: () =>
      import('./appointments.routes').then((mod) => mod.appointments_routes),
  },
  {
    path: 'system',
    loadChildren: () =>
      import('./system.routes').then((mod) => mod.system_routes),
  },
  {
    path: 'accounts',
    loadComponent: () =>
      import('../dashboard/accounts/accounts.component').then(
        (module) => module.AccountsComponent,
      ),
  },
  {
    path: 'people',
    loadComponent: () =>
      import('../dashboard/people/people.component').then(
        (m) => m.PeopleComponent,
      ),
  },
  {
    path: 'people/add',
    loadComponent: () =>
      import('../dashboard/people/add-edit-person/add-edit-person.component').then(
        (m) => m.AddEditPersonComponent,
      ),
  },

  // مسار التعديل (Edit) ويحتاج لرقم المعرف id
  {
    path: 'people/edit/:id',
    loadComponent: () =>
      import('../dashboard/people/add-edit-person/add-edit-person.component').then(
        (m) => m.AddEditPersonComponent,
      ),
  },
];
