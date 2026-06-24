import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { EventService } from '../events/services/event.service';
import { GalleryMediaDto } from '../events/models/event.model';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MatIconModule } from '@angular/material/icon';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [CommonModule, RouterModule, PageHeaderComponent, MatIconModule],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit {
  private eventService = inject(EventService);

  galleryMedia$: Observable<GalleryMediaDto[]>;

  ngOnInit(): void {
    this.galleryMedia$ = this.eventService.getGalleryMedia();
  }

  getMediaPath(filePath: string): string {
    if (filePath.startsWith('http')) {
      return filePath;
    }
    const apiBase = environment.apiUrl || '';
    const baseUrl = apiBase.endsWith('/') ? apiBase : `${apiBase}/`;
    const path = filePath.startsWith('/') ? filePath.substring(1) : filePath;
    return `${baseUrl}${path}`;
  }
}
