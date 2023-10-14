import jwtDecode from "jwt-decode";

/**
 * Helper class for managing JWT tokens.
 */
export default class GetToken {

  /**
  * Retrieves the JWT token from the localStorage.
  * @returns The JWT token or null if not found.
  */
  static getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
* Decodes a JWT token using the jwt-decode library.
* @param token - The JWT token to decode.
* @returns The decoded token.
*/
  static decodeToken(token: string): any {
    const decodedToken = jwtDecode(token);
    return decodedToken;
  }

  /**
* Retrieves the refresh token from the localStorage.
* @returns The refresh token or null if not found.
*/
  static getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }
}
