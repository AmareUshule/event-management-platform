import { Component, Inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

// New, more robust data interface
export interface LightboxData {
  items: { 
    imageUrl: string; 
    title: string; 
    fileName?: string; 
  }[];
  currentIndex: number;
}

@Component({
  selector: 'app-image-lightbox',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule
  ],
  template: `
    <div class="lightbox-backdrop" (click)="close()">
      <!-- Close Button -->
      <button mat-icon-button class="control-button top-right" (click)="close()" matTooltip="Close (Esc)">
        <mat-icon>close</mat-icon>
      </button>

      <!-- Header Actions -->
      <div class="control-button top-left">
        <!-- Download -->
        <a mat-icon-button 
           [href]="currentItem.imageUrl" 
           [download]="currentItem.fileName" 
           (click)="$event.stopPropagation()" 
           matTooltip="Download Image">
          <mat-icon>download</mat-icon>
        </a>
      </div>

      <!-- Content -->
      <div class="lightbox-content">
        <!-- Prev Button -->
        <button mat-icon-button class="nav-button prev" (click)="previous(); $event.stopPropagation()" *ngIf="hasPrevious()">
          <mat-icon>chevron_left</mat-icon>
        </button>

        <!-- Image -->
        <img [src]="currentItem.imageUrl" [alt]="currentItem.title" (click)="$event.stopPropagation()" class="main-image">
        
        <!-- Next Button -->
        <button mat-icon-button class="nav-button next" (click)="next(); $event.stopPropagation()" *ngIf="hasNext()">
          <mat-icon>chevron_right</mat-icon>
        </button>
      </div>

      <!-- Footer Info -->
      <div class="lightbox-footer">
        <span class="image-title">{{ currentItem.title }}</span>
        <span class="image-counter" *ngIf="data.items.length > 1">{{ data.currentIndex + 1 }} / {{ data.items.length }}</span>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .mat-dialog-container {
      padding: 0 !important;
      overflow: hidden !important;
    }
    
    .lightbox-backdrop {
      height: 100%;
      width: 100%;
      background-color: rgba(0, 0, 0, 0.92);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
      color: white;
    }

    .control-button {
      position: absolute;
      z-index: 10;
      color: white;
      background-color: rgba(0, 0, 0, 0.3);
    }
    .top-right {
      top: 16px;
      right: 16px;
    }
    .top-left {
      top: 16px;
      left: 16px;
    }
    .top-left a {
      color: white;
    }

    .lightbox-content {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
    }

    .main-image {
      max-height: 90%;
      max-width: 90%;
      object-fit: contain;
      box-shadow: 0 8px 30px rgba(0,0,0,0.5);
      -webkit-user-drag: none;
      user-select: none;
      cursor: default;
    }

    .nav-button {
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      background-color: rgba(0, 0, 0, 0.3);
      color: white;
      transition: opacity 0.2s ease-in-out;

      mat-icon {
        font-size: 36px;
        height: 36px;
        width: 36px;
      }
    }
    .lightbox-backdrop:not(:hover) .nav-button {
      opacity: 0;
    }
    .prev { left: 16px; }
    .next { right: 16px; }

    .lightbox-footer {
      position: absolute;
      bottom: 16px;
      left: 50%;
      transform: translateX(-50%);
      background-color: rgba(0, 0, 0, 0.5);
      padding: 8px 16px;
      border-radius: 8px;
      text-align: center;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 4px;
      align-items: center;
    }
    .image-title {
      font-size: 1rem;
      font-weight: 500;
    }
    .image-counter {
      font-size: 0.8rem;
      color: rgba(255,255,255,0.7);
    }
  `]
})
export class ImageLightboxComponent implements OnInit {

  currentItem: { imageUrl: string; title: string; fileName?: string; };

  constructor(
    public dialogRef: MatDialogRef<ImageLightboxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LightboxData
  ) {
    this.currentItem = this.data.items[this.data.currentIndex];
  }

  ngOnInit(): void {}

  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    this.close();
  }
  
  @HostListener('document:keydown.arrowright', ['$event'])
  onArrowRight(event: KeyboardEvent): void {
    this.next();
  }

  @HostListener('document:keydown.arrowleft', ['$event'])
  onArrowLeft(event: KeyboardEvent): void {
    this.previous();
  }

  close(): void {
    this.dialogRef.close();
  }

  hasNext(): boolean {
    return this.data.currentIndex < this.data.items.length - 1;
  }

  hasPrevious(): boolean {
    return this.data.currentIndex > 0;
  }

  next(): void {
    if (!this.hasNext()) return;
    this.data.currentIndex++;
    this.currentItem = this.data.items[this.data.currentIndex];
  }

  previous(): void {
    if (!this.hasPrevious()) return;
    this.data.currentIndex--;
    this.currentItem = this.data.items[this.data.currentIndex];
  }
}
