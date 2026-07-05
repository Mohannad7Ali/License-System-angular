import { environment } from '../environment';

export const DRIVER_API_ENDPOINT = {
  // 1. جلب القائمة الكاملة للسائقين (صيغة العرض الشاملة) والإنشاء الإحصائي للعدد
  all: `${environment.apiBaseUrl}/driver/drivers`,
  count: `${environment.apiBaseUrl}/driver/count`,
  create: `${environment.apiBaseUrl}/driver`,

  // ✅ 2. تصحيح رابط القراءة وتحويله لدالة ديناميكية تستقبل الـ id
  read: (id: number) => `${environment.apiBaseUrl}/driver/${id}`,
  read_view: (driverid: number) => `${environment.apiBaseUrl}/driver/${driverid}/driver-view`,
  update: (id: number) => `${environment.apiBaseUrl}/driver/${id}`,
  delete: (id: number) => `${environment.apiBaseUrl}/driver/${id}`,

  // 3. روابط جلب رخص القيادة المخصصة للسائق (المحلية والدولية)
  localLicenses: (driverid: number) =>
    `${environment.apiBaseUrl}/driver/${driverid}/local-licenses`,
  internationalLicenses: (driverid: number) =>
    `${environment.apiBaseUrl}/driver/${driverid}/international-licenses`,
};