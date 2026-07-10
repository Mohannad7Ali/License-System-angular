// import { environment } from '../environment';

// export const DETAINED_LICENSE_API_ENDPOINT = {
//   read_bu_licenseID: (licenseID: number) =>
//     `${environment.apiBaseUrl}/detainedLicense/by-license-id/${licenseID}`,
//   all: `${environment.apiBaseUrl}/detainedLicense/detained-licenses`,
// };

import { environment } from '../environment';

export const DETAINED_LICENSE_API_ENDPOINT = {
  // 1. جلب قائمة العرض الشاملة لجميع الرخص المحتجزة وإنشاء رخصة محتجزة جديدة
  all: `${environment.apiBaseUrl}/DetainedLicense/detained-licenses`,
  create: `${environment.apiBaseUrl}/DetainedLicense`,

  // 2. العمليات الأساسية المعتمدة على الـ ID الخاص بـ Detain نفسه
  read: (id: number) => `${environment.apiBaseUrl}/DetainedLicense/${id}`,
  update: (id: number) => `${environment.apiBaseUrl}/DetainedLicense/${id}`,
  delete: (id: number) => `${environment.apiBaseUrl}/DetainedLicense/${id}`,
  release: (licenseId: number, userId: number) =>
    `${environment.apiBaseUrl}/api/license/${licenseId}/release/by-user-id/${userId}`,
  // 3. قراءة تفاصيل الاحتجاز بواسطة الـ ID الخاص بالرخصة (LicenseID)
  read_by_licenseID: (licenseID: number) =>
    `${environment.apiBaseUrl}/DetainedLicense/by-license-id/${licenseID}`,
};
