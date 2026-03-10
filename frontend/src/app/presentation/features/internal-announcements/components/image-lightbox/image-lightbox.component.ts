import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';

export interface LightboxData {
  imageUrl: string;
  title: string;
  fileName?: string;
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
    <div class="lightbox-container">
      <div class="lightbox-header">
        <span class="image-title">{{ data.title }}</span>
        <div class="actions">
          <button mat-icon-button (click)="downloadImage()" matTooltip="Download Image">
            <mat-icon>download</mat-icon>
          </button>
          <button mat-icon-button (click)="close()" matTooltip="Close">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>
      <div class="lightbox-content" (click)="close()">
        <img [src]="data.imageUrl" [alt]="data.title" (click)="$event.stopPropagation()">
      </div>
    </div>
  `,
  styles: [`
    .lightbox-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      width: 100vw;
      background-color: rgba(0, 0, 0, 0.9);
      color: white;
    }

    .lightbox-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 10px 20px;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: 10;
    }

    .image-title {
      font-size: 1.2rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 70%;
    }

    .actions {
      display: flex;
      gap: 10px;
    }

    .lightbox-content {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      cursor: zoom-out;
    }

    .lightbox-content img {
      max-height: 90%;
      max-width: 90%;
      object-fit: contain;
      cursor: default;
      transition: transform 0.3s ease;
      box-shadow: 0 0 30px rgba(0, 0, 0, 0.5);
    }
  `]
})
export class ImageLightboxComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<ImageLightboxComponent>,
    @Inject(MAT_DIALOG_DATA) public data: LightboxData
  ) {}

  ngOnInit(): void {}

  close(): void {
    this.dialogRef.close();
  }

  downloadImage(): void {
    const link = document.createElement('a');
    link.href = this.data.imageUrl;
    link.download = this.data.fileName || 'image.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
