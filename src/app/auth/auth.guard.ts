import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, RouterStateSnapshot } from '@angular/router';
import { Injectable } from '@angular/core';
import { GoogleAuthService } from './auth.service';

class UserToken {
}

class Permissions {
  canActivate(): boolean {
    return true;
  }
}

@Injectable({providedIn: 'root'})
export class CanActivateChat implements CanActivate {
  constructor(private auth: GoogleAuthService) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): MaybeAsync<GuardResult> {
    return !!this.auth.getCurrentUser();
    // return true;
  }
}
