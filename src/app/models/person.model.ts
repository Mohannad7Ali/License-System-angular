export interface Person {
  id: number;
  firstName: string;
  secondName: string;
  thirdName: string;
  lastName: string;
  nationalNumber: string;
  address: string;
  email: string;
  phoneNumber: string;
  birthDate: string; // ISO String
  personalPicture: string; // Base64 String
  nationality: string;
  gender: string;
  createdByUserID: number;
  creationDate: string; // ISO String
  updatedByUserID: number | null;
  updatedDate: string | null; // ISO String
}
