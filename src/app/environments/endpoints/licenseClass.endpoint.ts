// import { environment } from '../environment';

// export const LICENSE_CLASS_API_ENDPOINT = {
//   allClasses: `${environment.apiBaseUrl}/licenseClass/license-classes`,
//   read: `${environment.apiBaseUrl}/licenseClass/`,
// };
import { environment } from '../environment';

export const LICENSE_CLASS_API_ENDPOINT = {
  // 1. جلب كل أصناف الرخص، وجلب قائمة الأسماء فقط، وعملية الإنشاء
  allClasses: `${environment.apiBaseUrl}/licenseClass/license-classes`,
  classesNames: `${environment.apiBaseUrl}/licenseClass/classes-name`,
  create: `${environment.apiBaseUrl}/licenseClass`,

  // ✅ 2. تحويل العمليات المعتمدة على الـ ID إلى دالات ديناميكية آمنة ومطابقة للسيرفر
  read: (id: number) => `${environment.apiBaseUrl}/licenseClass/${id}`,
  update: (id: number) => `${environment.apiBaseUrl}/licenseClass/${id}`,
  delete: (id: number) => `${environment.apiBaseUrl}/licenseClass/${id}`,
};