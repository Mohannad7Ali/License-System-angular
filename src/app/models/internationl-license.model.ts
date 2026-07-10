// International License Model
export interface InternationalLicense {
  internationalLicenseID: number; // المسمى الأصلي كما أرسلته
  applicationID: number;
  driverID: number;
  issuedUsingLocalLicenseID: number; // المسمى الأصلي كما أرسلته
  issueDate: string;
  expirationDate: string; // المسمى الأصلي كما أرسلته
  isActive: boolean;
  createdByUserID: number;
}

export interface ShortInternationalLicense {
  licenseID: number;
  applicationID: number;
  issuedUsingLocalLicenseID: number;
  issueDate: Date;
  expirationDate: Date;
  isActive: boolean;
}
