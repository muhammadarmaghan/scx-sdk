type AuthResponse = {
  expires_in: number;
  refresh_token: string;
  token_type: string;
  session_state: string;
  access_token: string;
  refresh_expires_in: number;
  before: string | null;
  scope: string;
};

type UserInfo = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  role?: string | null;
  entityIds: string[];
  corporateId: string;
  tempPasswordUpdate?: boolean;
};

export { AuthResponse, UserInfo };
