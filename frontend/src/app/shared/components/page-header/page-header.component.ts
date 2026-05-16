import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, RouterModule],
  template: `
    <header class="page-header animate-slide-up">
      <div class="breadcrumb" *ngIf="breadcrumb && breadcrumb.length > 0">
        <span *ngFor="let item of breadcrumb; let last = last" class="breadcrumb-item">
          <a [routerLink]="item.link" *ngIf="item.link">{{ item.label }}</a>
          <span *ngIf="!item.link">{{ item.label }}</span>
          <mat-icon *ngIf="!last">chevron_right</mat-icon>
        </span>
      </div>
      
      <div class="header-main">
        <div class="title-section">
          <h1 class="page-title">{{ title }}</h1>
          <p class="page-subtitle" *ngIf="subtitle">{{ subtitle }}</p>
        </div>
        
        <div class="actions-section">
          <ng-content select="[actions]"></ng-content>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .page-header {
      margin-bottom: var(--space-8);
    }
    .breadcrumb {
      display: flex;
      align-items: center;
      gap: var(--space-1);
      margin-bottom: var(--space-2);
      font-size: var(--text-xs);
      color: var(--text-muted);
      
      .breadcrumb-item {
        display: flex;
        align-items: center;
        gap: var(--space-1);
      }

      a {
        color: var(--text-muted);
        text-decoration: none;
        transition: var(--transition-fast);
        &:hover { color: var(--brand-primary); }
      }
      mat-icon { font-size: 14px; width: 14px; height: 14px; }
    }
    .header-main {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-4);
      flex-wrap: wrap;
    }
    .page-title {
      margin: 0;
      font-size: var(--text-3xl);
      font-weight: 800;
      letter-spacing: -0.03em;
      color: var(--text-main);
    }
    .page-subtitle {
      margin: var(--space-1) 0 0 0;
      font-size: var(--text-base);
      color: var(--text-secondary);
    }
    .actions-section {
      display: flex;
      gap: var(--space-3);
      align-items: center;
    }

    @media (max-width: 768px) {
      .header-main {
        flex-direction: column;
        align-items: flex-start;
      }
      .actions-section {
        width: 100%;
        overflow-x: auto;
        padding-bottom: var(--space-2);
      }
    }
  `]
})
export class PageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() breadcrumb?: { label: string, link?: string }[];
}
