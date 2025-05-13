import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
// import { environment } from '../environments/environment';

// Import Google's authentication library
declare var google: any;

@Injectable({
  providedIn: 'root'
})
export class GoogleAuthService {
  private userSubject = new BehaviorSubject<any>(null);
  public user$: Observable<any> = this.userSubject.asObservable();

  constructor() {
    this.initializeGoogleAuth();
  }

  private initializeGoogleAuth() {
    // Load Google's authentication library
    (google as any).accounts.id.initialize({
      client_id: '<>', // fetch later
      callback: this.handleCredentialResponse.bind(this)
    });
  }

  // Method to render Google Sign-In button
  renderSignInButton(elementId: string) {
    (google as any).accounts.id.renderButton(
      document.getElementById(elementId),
      {
        theme: 'outline',
        size: 'large'
      }
    );
  }

  // Handle the credential response from Google
  private handleCredentialResponse(response: any) {
    if (response.credential) {
      // Decode the JWT token
      const decodedToken = this.decodeJwtResponse(response.credential);
      console.log(decodedToken);
      // Update the user subject with decoded information
      this.userSubject.next({
        name: decodedToken.name,
        email: decodedToken.email,
        picture: decodedToken.picture,
        token: response.credential
      });
    }
  }

  // Decode the JWT response from Google
  private decodeJwtResponse(token: string): any {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
  }

  // Method to trigger sign-in programmatically
  triggerSignIn() {
    (google as any).accounts.id.prompt();
  }

  // Method to sign out
  signOut() {
    (google as any).accounts.id.disableAutoSelect();
    this.userSubject.next(null);
  }

  // Check if user is currently authenticated
  isAuthenticated(): boolean {
    return this.userSubject.value !== null;
  }

  // Get current user
  getCurrentUser(): any {
    return this.userSubject.value;
  }
}
