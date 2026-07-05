// import { environment } from '../environment';
// export const PERSON_API_ENDPOINTS = {
//   all: `${environment.apiBaseUrl}/person/people`,
//   read: `${environment.apiBaseUrl}/person/`,
//   create: `${environment.apiBaseUrl}/person`,
//   update: `${environment.apiBaseUrl}/person/`,
//   delete: `${environment.apiBaseUrl}/person/`,
//   isExist: (id: number) => `${environment.apiBaseUrl}/person/${id}/is-exist`,
//   isExistNationalNo: (nationalNo: string) =>
//     `${environment.apiBaseUrl}/person/No:${nationalNo}/is-exist`,
//   fullName: (id: number) => `${environment.apiBaseUrl}/person/${id}/full-name`,
//   male_percentage: `${environment.apiBaseUrl}/person/all-male-percetage`,
//   female_percentage: `${environment.apiBaseUrl}/person/all-female-percetage`,
// };

import { environment } from '../environment';

export const PERSON_API_ENDPOINTS = {
  // جلب كل الأشخاص
  all: `${environment.apiBaseUrl}/person/people`,
  
  // ✅ تحويل الروابط الأساسية إلى دالتين ديناميكيتين لضمان سلامة الـ URL
  read: (id: number) => `${environment.apiBaseUrl}/person/${id}`,
  create: `${environment.apiBaseUrl}/person`,
  update: (id: number) => `${environment.apiBaseUrl}/person/${id}`,
  delete: (id: number) => `${environment.apiBaseUrl}/person/${id}`,
  
  // الفحوصات
  isExist: (id: number) => `${environment.apiBaseUrl}/person/${id}/is-exist`,
  isExistNationalNo: (nationalNo: string) => `${environment.apiBaseUrl}/person/No:${nationalNo}/is-exist`,
  fullName: (id: number) => `${environment.apiBaseUrl}/person/${id}/full-name`,
  
  // ✅ تصحيح الأخطاء الإملائية هنا بإضافة حرف الـ n ليطابق الـ Controller تماماً
  male_percentage: `${environment.apiBaseUrl}/person/all-male-percentage`,
  female_percentage: `${environment.apiBaseUrl}/person/all-female-percentage`,
};