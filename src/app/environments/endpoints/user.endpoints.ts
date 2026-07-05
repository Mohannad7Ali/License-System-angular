// import { environment } from '../environment';
// export const USER_API_ENDPOINTS = {
//   all: `${environment.apiBaseUrl}/user/users`,
//   read: `${environment.apiBaseUrl}/user/`,
//   create: `${environment.apiBaseUrl}/user`,
//   update: `${environment.apiBaseUrl}/user/`,
//   delete: `${environment.apiBaseUrl}/user/`,
//   readByUsername: (username: string) => `${environment.apiBaseUrl}/user/username/${username}`,
//   isExist: (id: number) => `${environment.apiBaseUrl}/user/${id}/existance`,
// };

  
import { environment } from '../environment';

export const USER_API_ENDPOINTS = {
  // 1. العمليات العامة والشاملة للمستخدمين
  all: `${environment.apiBaseUrl}/user/users`,
  create: `${environment.apiBaseUrl}/user`,

  // ✅ 2. تحويل جميع العمليات الفردية المعتمدة على الـ ID إلى دالات ديناميكية آمنة ومطابقة للسيرفر تماماً
  read: (id: number) => `${environment.apiBaseUrl}/user/${id}`,
  update: (id: number) => `${environment.apiBaseUrl}/user/${id}`,
  delete: (id: number) => `${environment.apiBaseUrl}/user/${id}`,

  // 3. الاستعلامات الخاصة بالبحث والتحقق
  readByUsername: (username: string) => `${environment.apiBaseUrl}/user/username/${username}`,
  isExist: (id: number) => `${environment.apiBaseUrl}/user/${id}/existance`,
};