// import { environment } from '../environment';

// export const APPLICATION_API_ENDPOINT = {
//   create: `${environment.apiBaseUrl}/application`,
//   read: `${environment.apiBaseUrl}/application/`,
//   count: `${environment.apiBaseUrl}/application/count`,
  
// };
import { environment } from '../environment';

export const APPLICATION_API_ENDPOINT = {
  // إنشاء طلب جديد وحساب العدد الإجمالي
  create: `${environment.apiBaseUrl}/application`,
  count: `${environment.apiBaseUrl}/application/count`,

  // ✅ تحويل الروابط الأساسية إلى دالات ديناميكية آمنة تمرر الـ ID مباشرة
  read: (id: number) => `${environment.apiBaseUrl}/application/${id}`,
  update: (id: number) => `${environment.apiBaseUrl}/application/${id}`,
  delete: (id: number) => `${environment.apiBaseUrl}/application/${id}`,

  // ✅ إضافة الروابط الجديدة والمصلحة إملائياً من الباك إند (Patch & Get)
  complete: (id: number) => `${environment.apiBaseUrl}/application/${id}/complete`,
  cancel: (id: number) => `${environment.apiBaseUrl}/application/${id}/cancel`,
  paidFees: (id: number) => `${environment.apiBaseUrl}/application/${id}/paid-fees`,
};