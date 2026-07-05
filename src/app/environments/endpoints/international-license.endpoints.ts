// import { env } from 'process';
// import { environment } from '../environment';
// export const INTERNATIONAL_API_ENDPOINTS = {
//   read: (id: number) => `${environment.apiBaseUrl}/internationalLicense/${id}`,
//   all: `${environment.apiBaseUrl}/internationalLicense/international-licenses`,
// };

import { environment } from '../environment';

export const INTERNATIONAL_API_ENDPOINTS = {
  // 1. جلب كل الرخص الدولية وإنشاء رخصة دولية جديدة
  all: `${environment.apiBaseUrl}/internationalLicense/international-licenses`,
  create: `${environment.apiBaseUrl}/internationalLicense`,

  // 2. العمليات المعتمدة على الـ ID الخاص بالرخصة الدولية
  read: (id: number) => `${environment.apiBaseUrl}/internationalLicense/${id}`,
  update: (id: number) => `${environment.apiBaseUrl}/internationalLicense/${id}`,
  delete: (id: number) => `${environment.apiBaseUrl}/internationalLicense/${id}`,
};