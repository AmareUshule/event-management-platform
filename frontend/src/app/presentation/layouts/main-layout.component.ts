import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, FooterComponent],
  template: `
    <div class="app-layout">
      <app-header></app-header>
      <main class="main-content">
        <div class="container">
          <router-outlet></router-outlet>
        </div>
      </main>
      <app-footer></app-footer>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      flex-direction: column;
      min-height: 100vh;
      background: var(--bg-app);
    }
    .main-content {
      flex: 1;
      padding-top: 0; // Removed offset for floating header
      padding-bottom: var(--space-12);
      width: 100%;
    }
    .container {
      max-width: 1440px;
      margin: 0 auto;
      padding: 0 var(--space-6);
    }

    @media (max-width: 768px) {
      .container {
        padding: 0 var(--space-4);
      }
      .main-content {
        padding-top: 0;
      }
    }
  `]
})
export class MainLayoutComponent {}
