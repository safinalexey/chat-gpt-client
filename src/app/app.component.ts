import { Component } from '@angular/core';
import { ChatComponent } from './components/chat/chat.component';
import { GoogleAuthService } from './auth/auth.service';

// import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [
    // RouterOutlet,
    // RouterLink,
    // RouterLinkActive,
    ChatComponent,
    // ChatComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'chat-gpt-client';
  authorized = false;

  constructor(
    public authService: GoogleAuthService,
    // public authService: AuthService,
  ) {
  }

  ngOnInit() {
    // Render the Google Sign-In button
    if (this.authService.isAuthenticated()) {
      this.authorized = true;
    } else {
      this.authService.renderSignInButton('googleSignInButton');
    }
  }
}
