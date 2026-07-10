export interface User {
  id: number;
  personID: number;
  fullName?: string;
  username: string;
  isActive: boolean;
  password?: string;
}
