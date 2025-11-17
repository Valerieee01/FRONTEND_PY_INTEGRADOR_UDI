import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { AuthService } from '../../service/auth'; 
import { Router } from '@angular/router';


@Component({
  selector: 'app-inicio-sesion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './inicio-sesion.html',
  styleUrls: ['./inicio-sesion.css']
})
export class InicioSesion {

  loginForm: FormGroup;
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private AuthService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      correo: ['', [Validators.required, Validators.email]],
      contrasena: ['', Validators.required],
      remember: [false]
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  submit() {
    if (this.loginForm.invalid) {
      this.showErrors();
      return;
    }

    const datos = this.loginForm.value;
    console.log(datos);
    

    this.AuthService.login(datos).subscribe({
      next: (resp) => {        
        localStorage.setItem('accessToken', resp.data.accessToken);
        localStorage.setItem('refreshToken', resp.data.refreshToken);


        Swal.fire({
          icon: 'success',
          title: 'Acceso concedido',
          text: 'Inicio de sesión correcto',
          confirmButtonColor: '#2e7d32'
        }).then(() => {
        this.router.navigate(['Inicio']);  
      });
      },
      error: (err) => {
        Swal.fire({
          icon: 'error',
          title: 'Error al iniciar sesión',
          text: err.error?.message || 'Credenciales incorrectas',
          confirmButtonColor: '#2e7d32'
        });
      }
    });
  }

  showErrors() {
    const email = this.loginForm.get('correo');
    const password = this.loginForm.get('contrasena');

    if (email?.hasError('required')) {
      Swal.fire({
        icon: 'error',
        title: 'Correo obligatorio',
        text: 'Debes ingresar un correo electrónico.',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }

    if (email?.hasError('email')) {
      Swal.fire({
        icon: 'warning',
        title: 'Correo inválido',
        text: 'Ingresa un formato de correo válido.',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }

    if (password?.hasError('required')) {
      Swal.fire({
        icon: 'error',
        title: 'Contraseña obligatoria',
        text: 'Debes ingresar la contraseña.',
        confirmButtonColor: '#2e7d32'
      });
      return;
    }
  }
}
