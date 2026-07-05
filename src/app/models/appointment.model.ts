export interface Appointment {
  id: number;
  date: Date;
  paidFees: number;
  isLocked: boolean;
  testType: number;
  localLicenseApplicationID: number;
  createdByUserID: number;
  retakeTestID: number | null;
}

export interface Appointment_View {
  testAppointmentID: number;
  testType: number;
  localDrivingLicenseApplicationID: number;
  fullName: string;
  date: Date;
  paidFees: number;
  isLocked: boolean;
  testTypeTitle?: string;
}
