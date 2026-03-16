import { Component, OnInit, inject, OnDestroy, ChangeDetectorRef, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { MatTabsModule } from '@angular/material/tabs';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { AnnouncementService, PagedResponse } from '../../services/announcement.service';
import { Announcement, CreateAnnouncementDto, UpdateAnnouncementDto } from '../../models/announcement.model';
import { AuthService } from '../../../../../core/auth/auth.service';
import { AnnouncementCardComponent } from '../../components/announcement-card/announcement-card.component';
import { AnnouncementFormComponent } from '../../components/announcement-form/announcement-form.component';
import { HeaderComponent } from '../../../../layouts/header/header.component';
import { Observable, Subject, takeUntil, finalize, switchMap, of, from, mergeMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-announcements-page',
  standalone: true,
  imports: [
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    AnnouncementCardComponent,
    AnnouncementFormComponent,
    HeaderComponent
  ],
  templateUrl: './announcements-page.component.html',
  styleUrls: ['./announcements-page.component.scss']
})
export class AnnouncementsPageComponent implements OnInit, OnDestroy {
  private announcementService = inject(AnnouncementService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);
  public router = inject(Router);
  private route = inject(ActivatedRoute);
  private cdr = inject(ChangeDetectorRef);
  private platformId = inject(PLATFORM_ID);

  publishedAnnouncements: Announcement[] = [];
  draftAnnouncements: Announcement[] = [];
  pendingAnnouncements: Announcement[] = [];
  rejectedAnnouncements: Announcement[] = [];
  
  isLoading = false;
  isSaving = false;
  showForm = false;
  selectedAnnouncement: Announcement | null = null;
  
  private destroy$ = new Subject<void>();

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadAnnouncements();
      this.route.queryParamMap
        .pipe(takeUntil(this.destroy$))
        .subscribe(params => {
          if (params.get('create') === 'true' && this.canCreate) {
            this.openCreateForm();
          }
        });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAnnouncements(): void {
    this.isLoading = true;
    this.cdr.detectChanges();
    
    setTimeout(() => {
      this.loadPublished();
      
      if (this.canCreate) {
        this.loadDrafts();
        this.loadRejected();
      }
      
      if (this.canPublish) {
        this.loadPending();
      }
    });
  }

  loadPublished(): void {
    this.announcementService.getPublishedAnnouncements()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { 
          this.isLoading = false; 
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => {
          // Extract items from paged response
          this.publishedAnnouncements = response.items || [];
        },
        error: () => this.snackBar.open('Failed to load published announcements', 'Close', { duration: 3000 })
      });
  }

  loadDrafts(): void {
    this.announcementService.getDraftAnnouncements()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => {
          // Extract items from paged response
          this.draftAnnouncements = response.items || [];
        },
        error: () => this.snackBar.open('Failed to load draft announcements', 'Close', { duration: 3000 })
      });
  }

  loadPending(): void {
    this.announcementService.getPendingAnnouncements()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cdr.detectChanges())
      )
      .subscribe({
        next: (response: any) => {
          this.pendingAnnouncements = response.items || [];
        },
        error: () => this.snackBar.open('Failed to load pending announcements', 'Close', { duration: 3000 })
      });
  }

  loadRejected(): void {
    this.announcementService.getRejectedAnnouncements()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.cdr.detectChanges())
      )
      .subscribe({
        next: (response: any) => {
          this.rejectedAnnouncements = response.items || [];
        },
        error: () => this.snackBar.open('Failed to load rejected announcements', 'Close', { duration: 3000 })
      });
  }

  get canCreate(): boolean {
    return this.authService.isAdmin() || this.authService.isManager();
  }

  get canManage(): boolean {
    return this.authService.isAdmin() || this.authService.isCommunicationManager();
  }

  get canPublish(): boolean {
    return this.authService.isCommunicationManager() || this.authService.isAdmin();
  }

  canManageAnnouncement(announcement: Announcement): boolean {
    if (this.canManage) return true;
    
    const currentUser = this.authService.getCurrentUser();
    return announcement.createdBy?.id === currentUser?.adObjectId;
  }

  openCreateForm(): void {
    this.selectedAnnouncement = null;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.selectedAnnouncement = null;
  }

  onEdit(announcement: Announcement): void {
    this.selectedAnnouncement = announcement;
    this.showForm = true;
  }

  onDelete(announcement: Announcement): void {
    if (confirm('Are you sure you want to delete this announcement?')) {
      this.announcementService.deleteAnnouncement(announcement.id)
        .subscribe({
          next: () => {
            this.snackBar.open('Announcement deleted', 'Close', { duration: 3000 });
            this.loadAnnouncements();
          },
          error: () => this.snackBar.open('Failed to delete announcement', 'Close', { duration: 3000 })
        });
    }
  }

  onPublish(announcement: Announcement): void {
    this.announcementService.publishAnnouncement(announcement.id)
      .subscribe({
        next: () => {
          this.snackBar.open('Announcement published successfully', 'Close', { duration: 3000 });
          this.loadAnnouncements();
        },
        error: () => this.snackBar.open('Failed to publish announcement', 'Close', { duration: 3000 })
      });
  }

  onSubmitForApproval(announcement: Announcement): void {
    this.announcementService.submitForApproval(announcement.id)
      .subscribe({
        next: () => {
          this.snackBar.open('Submitted for approval', 'Close', { duration: 3000 });
          this.loadAnnouncements();
        },
        error: () => this.snackBar.open('Failed to submit for approval', 'Close', { duration: 3000 })
      });
  }

  onReject(announcement: Announcement): void {
    this.announcementService.rejectAnnouncement(announcement.id)
      .subscribe({
        next: () => {
          this.snackBar.open('Announcement rejected', 'Close', { duration: 3000 });
          this.loadAnnouncements();
        },
        error: () => this.snackBar.open('Failed to reject announcement', 'Close', { duration: 3000 })
      });
  }

  onFormSubmit(data: { dto: CreateAnnouncementDto | UpdateAnnouncementDto, files: File[] }): void {
    this.isSaving = true;
    const { dto, files } = data;

    const uploadFiles = (announcementId: string, uploadedFiles: File[]): Observable<any> => {
      if (uploadedFiles.length === 0) {
        return of(null);
      }
      // Upload files one by one (or in parallel if desired)
      return from(uploadedFiles).pipe(
        mergeMap(file => this.announcementService.uploadMedia(announcementId, file))
      );
    };

    if (this.selectedAnnouncement) {
      // Update existing
      this.announcementService.updateAnnouncement(this.selectedAnnouncement.id, dto as UpdateAnnouncementDto)
        .pipe(
          switchMap(announcement => uploadFiles(announcement.id, files)),
          finalize(() => this.isSaving = false)
        )
        .subscribe({
          next: () => {
            this.snackBar.open('Announcement updated successfully', 'Close', { duration: 3000 });
            this.closeForm();
            this.loadAnnouncements();
          },
          error: (err) => {
            console.error('Update failed:', err);
            this.snackBar.open(`Update failed: ${err.message || 'Unknown error'}`, 'Close', { duration: 5000 });
          }
        });
    } else {
      // Create new
      this.announcementService.createAnnouncement(dto as CreateAnnouncementDto)
        .pipe(
          switchMap(announcement => uploadFiles(announcement.id, files)),
          finalize(() => this.isSaving = false)
        )
        .subscribe({
          next: () => {
            this.snackBar.open('Announcement created successfully', 'Close', { duration: 3000 });
            this.closeForm();
            this.loadAnnouncements();
          },
          error: (err) => {
            console.error('Creation failed:', err);
            this.snackBar.open(`Creation failed: ${err.message || 'Unknown error'}`, 'Close', { duration: 5000 });
          }
        });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
