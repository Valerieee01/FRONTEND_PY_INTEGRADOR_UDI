import { Component, ViewEncapsulation } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../service/auth';


@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [RouterModule],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.css',

})
export class AdminLayout {

  constructor(
    private AuthService: AuthService,
    private router: Router
  ) {}

  cerrarSesion() {
    this.AuthService.logout();
    this.router.navigate(['/login']); 
  }
}
