// import { environment } from '../environment';

// export const APPOINTMENT_API_ENDPOINT = {
//   readView: (id: number) =>
//     `${environment.apiBaseUrl}/appointment/appointment-view/${id}`,
//   all: `${environment.apiBaseUrl}/appointment/appointments-view`,
//   add: `${environment.apiBaseUrl}/appointment`,
//   read: (test_type: number, local_app: number) =>
//     `${environment.apiBaseUrl}/appointment/test-type/${test_type}/local-app/${local_app}`,
//   active_appointments: (test_type: number, local_app: number) =>
//     `${environment.apiBaseUrl}/appointment/active-appointments-exist/by-test-type/${test_type}/local-app/${local_app}`,
//   updateDate: (id: number, new_date: string) =>
//     `${environment.apiBaseUrl}/appointment/${id}/update-date/${new_date}`,
// };
import { environment } from '../environment';

export const APPOINTMENT_API_ENDPOINT = {
  // 1. إنشاء موعد وجلب قائمة العرض الشاملة لجدول المواعيد
  create: `${environment.apiBaseUrl}/Appointment`,
  all: `${environment.apiBaseUrl}/Appointment/appointments-view`,

  // 2. العمليات الأساسية المبنية على الـ ID (مع ضبط حالة الأحرف لـ Appointment)
  readById: (id: number) => `${environment.apiBaseUrl}/Appointment/${id}`,
  readView: (id: number) => `${environment.apiBaseUrl}/Appointment/appointment-view/${id}`,
  update: (id: number) => `${environment.apiBaseUrl}/Appointment/${id}`,
  delete: (id: number) => `${environment.apiBaseUrl}/Appointment/${id}`,

  // ✅ 3. تصحيح الرابط ليتوافق تماماً مع ترتيب الباك إند: testType أولاً ثم localAppId
  read: (testType: number, localAppId: number) =>
    `${environment.apiBaseUrl}/Appointment/test-type/${testType}/local-app/${localAppId}`,

  // ✅ 4. تصحيح دقيق لترتيب البارامترات في الباك إند (testType ثم localAppId)
  active_appointments: (testType: number, localAppId: number) =>
    `${environment.apiBaseUrl}/Appointment/active-appointments-exist/by-test-type/${testType}/local-app/${localAppId}`,

  // 5. جلب جدول المواعيد المخصصة لنوع اختبار معين داخل الطلب
  allAppointmentsPerTestType: (testType: number, localAppId: number) =>
    `${environment.apiBaseUrl}/Appointment/appointments/by-test-type/${testType}/local-app/${localAppId}`,

  // 6. تحديث تاريخ الموعد فقط
  updateDate: (id: number, newDate: string) =>
    `${environment.apiBaseUrl}/Appointment/${id}/update-date/${newDate}`,
};