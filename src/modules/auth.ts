import { NativeModules } from 'react-native';
import type { AuthStatus } from '../types/auth-status';
import type { ICheckSubscription } from '../types/check-subscription';

const { MusicModule } = NativeModules;

class Auth {
  /**
   * Requests authorization to access the user's Apple Music account.
   * This function returns a promise that resolves to the authorization status.
   * @returns {Promise<AuthStatus>} A promise that resolves to the authorization status of the user's Apple Music account.
   */
  public static authorize(): Promise<AuthStatus> {
    return new Promise((res, rej) => {
      try {
        MusicModule.authorization(res);
      } catch (error) {
        console.error('Apple Music Kit: Authorize failed.', error);

        rej(error);
      }
    });
  }

  private static developerToken: { token: string; lastFetched: Date } | null = null;

  private static musicUserToken: { token: string; lastFetched: Date } | null = null;

  /**
   * Get developer token
   * @returns {Promise<string>} A promise that resolves to the developer token.
   */
  public static getDeveloperToken(): Promise<string> {
    return new Promise((res, rej) => {
      if (
        this.developerToken != null &&
        this.developerToken.lastFetched.getTime() + 1000 * 60 * 15 < Date.now()
      ) {
        res(this.developerToken.token);

        return;
      }

      try {
        MusicModule.developerToken((token: string) => {
          this.developerToken = { token, lastFetched: new Date() };
          res(token);
        });
      } catch (error) {
        console.error('Apple Music Kit: Get developer token failed.', error);
        rej(error);
      }
    });
  }

  /**
   * Get music user token
   * @param {string} developerToken - The developer token.
   * @returns {Promise<string>} A promise that resolves to the music user token.
   */
  public static getMusicUserToken(developerToken: string): Promise<string> {
    return new Promise((res, rej) => {
      if (
        this.musicUserToken != null &&
        this.musicUserToken.lastFetched.getTime() + 1000 * 60 * 15 < Date.now()
      ) {
        res(this.musicUserToken.token);

        return;
      }

      try {
        MusicModule.musicUserToken(developerToken, (token: string) => {
          this.musicUserToken = { token, lastFetched: new Date() };
          res(token);
        });
      } catch (error) {
        console.error('Apple Music Kit: Get music user token failed.', error);
        rej(error);
      }
    });
  }

  /**
   * Checks the user's subscription status for Apple Music.
   * @returns {Promise<ICheckSubscription>} A promise that resolves to the subscription status.
   */
  public static async checkSubscription(): Promise<ICheckSubscription> {
    try {
      const result: ICheckSubscription = await MusicModule.checkSubscription();

      return result;
    } catch (error) {
      console.error('Apple Music Kit: Check subscription failed.', error);

      return {
        canPlayCatalogContent: false,
        hasCloudLibraryEnabled: false,
        isMusicCatalogSubscriptionEligible: false,
      };
    }
  }
}

export default Auth;
