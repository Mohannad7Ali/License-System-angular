// import { environment } from '../environment';

// export const LICENSE_API_ENDPOINT = {
//   count: `${environment.apiBaseUrl}/license/count`,
//   read: `${environment.apiBaseUrl}/license/`,
//   isDetained: (ID: number) =>
//     `${environment.apiBaseUrl}/license/${ID}/is-detained`,
//   detain: (ID: number, fees: number, byUserID: number) =>
//     `${environment.apiBaseUrl}/license/${ID}/detain/fees/${fees}/by-user-id/${byUserID}`,
//   release: (ID: number, byUserID: number) =>
//     `${environment.apiBaseUrl}/license/${ID}/release/by-user-id/${byUserID}`,
//   renew: (ID: number, notes: string, byUserID: number) =>
//     `${environment.apiBaseUrl}/license/${ID}/renew/by-user-id/${byUserID}?notes=${notes}`,

//   lostReplacement: (ID: number, byUserID: number) =>
//     `${environment.apiBaseUrl}/license/${ID}/lost-replacement/by-user-id/${byUserID}`,

//   damageReplacement: (ID: number, byUserID: number) =>
//     `${environment.apiBaseUrl}/license/${ID}/damaged-replacement/by-user-id/${byUserID}`,
// };
import { environment } from '../environment';

export const LICENSE_API_ENDPOINT = {
  // 1. العمليات الشاملة والأساسية على الرخص
  all: `${environment.apiBaseUrl}/license/licenses`,
  create: `${environment.apiBaseUrl}/license`,
  
  // ✅ تحويل الروابط الثابتة إلى دالات ديناميكية تستقبل المعاملات لتجنب الـ 404
  read: (id: number) => `${environment.apiBaseUrl}/license/${id}`,
  update: (id: number) => `${environment.apiBaseUrl}/license/${id}`,
  delete: (id: number) => `${environment.apiBaseUrl}/license/${id}`,

  // 2. عمليات التنشيط والتعطيل (HttpPatch)
  activate: (id: number) => `${environment.apiBaseUrl}/license/${id}/activate`,
  deactivate: (id: number) => `${environment.apiBaseUrl}/license/${id}/deactivate`,

  // 3. العمليات المتقدمة (تجديد، بدل ضائع، بدل تالف)
  renew: (ID: number, byUserID: number, notes: string) =>
    `${environment.apiBaseUrl}/license/${ID}/renew/by-user-id/${byUserID}?notes=${encodeURIComponent(notes)}`,

  lostReplacement: (ID: number, byUserID: number) =>
    `${environment.apiBaseUrl}/license/${ID}/lost-replacement/by-user-id/${byUserID}`,

  damageReplacement: (ID: number, byUserID: number) =>
    `${environment.apiBaseUrl}/license/${ID}/damaged-replacement/by-user-id/${byUserID}`,

  // 4. روابط مخصصة لعمليات الاحتجاز (إذا تم التعامل معها عبر الـ licenseController لاحقاً)
  count: `${environment.apiBaseUrl}/license/count`,
  isDetained: (ID: number) => `${environment.apiBaseUrl}/license/${ID}/is-detained`,
  detain: (ID: number, fees: number, byUserID: number) =>
    `${environment.apiBaseUrl}/license/${ID}/detain/fees/${fees}/by-user-id/${byUserID}`,
  release: (ID: number, byUserID: number) =>
    `${environment.apiBaseUrl}/license/${ID}/release/by-user-id/${byUserID}`,
};