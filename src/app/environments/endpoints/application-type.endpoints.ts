// import { environment } from '../environment';

// export const APPLICATION_TYPE_API_ENDPOINT = {
//   add: `${environment.apiBaseUrl}/applicationType/`,
//   read: `${environment.apiBaseUrl}/applicationType/`,
//   all: `${environment.apiBaseUrl}/applicationType/application-types`,
//   update: `${environment.apiBaseUrl}/applicationType/`,
//   fees: (id: number) =>
//     `${environment.apiBaseUrl}/applicationType/${id}/application-type-fees`,
//   delete: `${environment.apiBaseUrl}/applicationType/`,
// };

import { environment } from '../environment';

export const APPLICATION_TYPE_API_ENDPOINT = {
  // جلب كل أنواع الطلبات
  all: `${environment.apiBaseUrl}/applicationType/application-types`,
  
  // ✅ تحويل الروابط الأساسية إلى دالات ديناميكية آمنة تمرر الـ ID مباشرة
  read: (id: number) => `${environment.apiBaseUrl}/applicationType/${id}`,
  create: `${environment.apiBaseUrl}/applicationType`, // نفس مسار الـ add القديم ولكن بدون السلاش الأخيرة ليكون نظيفاً
  update: (id: number) => `${environment.apiBaseUrl}/applicationType/${id}`,
  delete: (id: number) => `${environment.apiBaseUrl}/applicationType/${id}`,
  
  // جلب الرسوم الخاصة بنوع طلب معين
  fees: (id: number) => `${environment.apiBaseUrl}/applicationType/${id}/application-type-fees`,
};