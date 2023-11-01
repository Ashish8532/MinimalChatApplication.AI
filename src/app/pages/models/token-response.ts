export interface TokenResponse<T> {
    message: string;
    accessToken: string;
    refreshToken: string;
    expiration: Date;
    profile: T;
  }
  