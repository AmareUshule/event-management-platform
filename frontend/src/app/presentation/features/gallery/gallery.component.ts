import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BehaviorSubject, Observable, Subscription, of, combineLatest } from 'rxjs';
import { catchError, debounceTime, map, shareReplay, startWith, switchMap, tap } from 'rxjs/operators';
import { EventService } from '../events/services/event.service';
import { MediaService, MediaCategory, MediaSubCategory } from '../../../core/services/media.service';
import { AuthService } from '../../../core/auth/auth.service';
import { GalleryMediaDto } from '../events/models/event.model';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

// Import Angular Material Modules
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { environment } from '../../../../environments/environment';
import { ImageLightboxComponent } from '../../../shared/components/image-lightbox/image-lightbox.component';

type ViewMode = 'folders' | 'all';
type FolderViewLevel = 'categories' | 'subcategories' | 'media';

interface Breadcrumb {
  name: string;
  level: FolderViewLevel;
  data?: any;
}

@Component({
  selector: 'app-gallery',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    PageHeaderComponent,
    MatIconModule,
    MatButtonModule,
    MatDialogModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatListModule,
    MatDividerModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    MatInputModule,
    MatAutocompleteModule,
    MatButtonToggleModule
  ],
  templateUrl: './gallery.component.html',
  styleUrls: ['./gallery.component.scss']
})
export class GalleryComponent implements OnInit, OnDestroy {
  // --- Injected Services ---
  private eventService = inject(EventService);
  private mediaService = inject(MediaService);
  private authService = inject(AuthService);
  private snackBar = inject(MatSnackBar);
  private dialog = inject(MatDialog);

  // --- View Mode State ---
  public viewMode: ViewMode = 'folders';

  // --- Common State ---
  public isLoading$ = new BehaviorSubject<boolean>(true);
  public isAdmin = false;

  // --- Folder View State ---
  public breadcrumbs: Breadcrumb[] = [{ name: 'Gallery', level: 'categories' }];
  public categories: MediaCategory[] = [];
  public subCategories: MediaSubCategory[] = [];
  public media: GalleryMediaDto[] = [];
  private folderViewTrigger$ = new BehaviorSubject<void>(undefined);
  
  // --- All Media View State ---
  public allMedia$: Observable<GalleryMediaDto[]>;
  private allMediaFilters$ = new BehaviorSubject<{ categoryId: string | null; subCategoryId: string | null }>({ categoryId: null, subCategoryId: null });
  public categoryControl = new FormControl<any | null>(null);
  public subCategoryControl = new FormControl<any | null>(null);
  public allViewCategories: MediaCategory[] = [];
  public allViewSubCategories: MediaSubCategory[] = [];
  public filteredCategoriesForFilterBar$: Observable<MediaCategory[]>;
  public filteredSubCategoriesForFilterBar$: Observable<MediaSubCategory[]>;

  // --- Admin Panel State ---
  public managementPanelVisible = false;
  public mgmtCategories: MediaCategory[] = [];
  public mgmtSubCategories: MediaSubCategory[] = [];
  public selectedMgmtCategory: MediaCategory | null = null;
  public isMgmtLoading = false;

  // --- Subscriptions ---
  private subscriptions = new Subscription();

  ngOnInit(): void {
    this.isAdmin = this.authService.isAdmin();
    
    // Initialize both views
    this.setupFolderView();
    this.setupAllMediaView();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // --- View Setup ---

  private setupFolderView(): void {
    const sub = this.folderViewTrigger$.pipe(
      tap(() => this.isLoading$.next(true)),
    ).subscribe(() => this.fetchDataForFolderView());
    this.subscriptions.add(sub);
  }

  private setupAllMediaView(): void {
    // Data stream for the flat list
    this.allMedia$ = this.allMediaFilters$.pipe(
      debounceTime(300),
      tap(() => this.isLoading$.next(true)),
      switchMap(filters => this.eventService.getGalleryMedia(filters.categoryId, filters.subCategoryId).pipe(
        catchError(error => {
          this.isLoading$.next(false);
          this.snackBar.open('Unable to load media. Please try again.', 'Close', { duration: 3000 });
          return of([]);
        })
      )),
      tap(() => this.isLoading$.next(false)),
      shareReplay({ bufferSize: 1, refCount: true })
    );
    this.subscriptions.add(this.allMedia$.subscribe());

    // --- New Reactive Filter Logic ---

    // Fetch all categories once for the main filter
    this.mediaService.getMediaCategories().subscribe(cats => (this.allViewCategories = cats));

    // Autocomplete for Category Filter
    this.filteredCategoriesForFilterBar$ = this.categoryControl.valueChanges.pipe(
      startWith(''),
      map(value => (typeof value === 'string' ? value : value?.name)),
      map(name => (name ? this._filterByName(this.allViewCategories, name) : this.allViewCategories.slice()))
    );

    // This stream holds the options for the sub-category dropdown.
    // It reacts to changes in the parent category selection.
    const subCategoryOptions$ = this.categoryControl.valueChanges.pipe(
      startWith(this.categoryControl.value),
      switchMap(category => {
        const categoryId = category && typeof category !== 'string' ? category.id : null;
        if (categoryId) {
          return this.mediaService.getSubCategories(categoryId);
        }
        return of([]); // If no category, return empty array of options
      }),
      tap(subCats => this.allViewSubCategories = subCats) // Keep the class property in sync
    );

    // This stream powers the sub-category autocomplete panel.
    // It combines the latest options with what the user is typing.
    this.filteredSubCategoriesForFilterBar$ = combineLatest([
      subCategoryOptions$,
      this.subCategoryControl.valueChanges.pipe(startWith(''))
    ]).pipe(
      map(([options, value]) => {
        const name = typeof value === 'string' ? value : value?.name;
        return name ? this._filterByName(options, name) : options.slice();
      })
    );

    // Subscription to handle category changes: reset sub-category and trigger media reload
    const categorySub = this.categoryControl.valueChanges.subscribe(category => {
      this.subCategoryControl.setValue(null, { emitEvent: false });
      const categoryId = category && typeof category !== 'string' ? category.id : null;
      this.allMediaFilters$.next({ categoryId: categoryId, subCategoryId: null });
    });

    // Subscription to handle sub-category changes: trigger media reload
    const subCategorySub = this.subCategoryControl.valueChanges.subscribe(subCategory => {
      const parentCategory = this.categoryControl.value;
      const parentCategoryId = parentCategory && typeof parentCategory !== 'string' ? parentCategory.id : null;
      const subCategoryId = subCategory && typeof subCategory !== 'string' ? subCategory.id : null;
      
      this.allMediaFilters$.next({
        categoryId: parentCategoryId,
        subCategoryId: subCategoryId
      });
    });

    this.subscriptions.add(categorySub);
    this.subscriptions.add(subCategorySub);
  }

  // --- Data Fetching ---

  private fetchDataForFolderView(): void {
    const currentLevel = this.breadcrumbs[this.breadcrumbs.length - 1];
    let stream: Observable<any>;

    switch (currentLevel.level) {
      case 'categories': stream = this.mediaService.getMediaCategories().pipe(tap(data => this.categories = data)); break;
      case 'subcategories': stream = this.mediaService.getSubCategories(currentLevel.data.id).pipe(tap(data => this.subCategories = data)); break;
      case 'media': stream = this.eventService.getGalleryMedia(null, currentLevel.data.id).pipe(tap(data => this.media = data)); break;
      default: stream = of([]);
    }
    
    stream.subscribe(() => this.isLoading$.next(false));
  }

  // --- Public View Methods ---

  setViewMode(mode: ViewMode): void {
    this.viewMode = mode;
    this.isLoading$.next(true);
    // Trigger a fetch for the selected view
    if (mode === 'folders') {
      this.folderViewTrigger$.next();
    } else {
      this.allMediaFilters$.next(this.allMediaFilters$.value); // Re-triggers the observable
    }
  }

  selectCategory(category: MediaCategory): void {
    this.breadcrumbs.push({ name: category.name, level: 'subcategories', data: category });
    this.folderViewTrigger$.next();
  }

  selectSubCategory(subCategory: MediaSubCategory): void {
    this.breadcrumbs.push({ name: subCategory.name, level: 'media', data: subCategory });
    this.folderViewTrigger$.next();
  }

  navigateToBreadcrumb(index: number): void {
    if (index < this.breadcrumbs.length - 1) {
      this.breadcrumbs = this.breadcrumbs.slice(0, index + 1);
      this.folderViewTrigger$.next();
    }
  }

  getCurrentViewLevel(): FolderViewLevel {
    return this.breadcrumbs[this.breadcrumbs.length - 1]?.level ?? 'categories';
  }

  getMediaPath(filePath: string): string {
    if (filePath?.startsWith('http')) return filePath;
    const apiBase = environment.apiUrl || '';
    const baseUrl = apiBase.endsWith('/') ? apiBase : `${apiBase}/`;
    const path = filePath?.startsWith('/') ? filePath.substring(1) : filePath;
    return `${baseUrl}${path}`;
  }

  openMedia(clickedItem: GalleryMediaDto, allItems: GalleryMediaDto[], clickedIndex: number): void {
    const type = clickedItem.fileType?.toString?.().toLowerCase();
    
    // We only open the lightbox for images.
    if (type !== 'image') {
      const url = this.getMediaPath(clickedItem.filePath);
      if (!url) {
        this.snackBar.open('Unable to open media. File URL is invalid.', 'Close', { duration: 3000 });
        return;
      }
      // Open non-images in a new tab
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        window.location.href = url;
      }
      return;
    }
  
    // Filter for only the image items to show in the lightbox navigation
    const imageItems = allItems.filter(item => item.fileType?.toString?.().toLowerCase() === 'image');
    const lightboxIndex = imageItems.findIndex(item => item.mediaId === clickedItem.mediaId);
  
    this.dialog.open(ImageLightboxComponent, {
      panelClass: 'gallery-lightbox-dialog',
      data: {
        items: imageItems.map(item => ({
          imageUrl: this.getMediaPath(item.filePath),
          title: item.eventTitle,
          fileName: this.getFileName(item.filePath)
        })),
        currentIndex: lightboxIndex >= 0 ? lightboxIndex : 0
      }
    });
  }

  private getFileName(filePath: string): string {
    if (!filePath) return 'download';
    const parts = filePath.split('/');
    return parts[parts.length - 1] || 'download';
  }

  // --- All Media View Helpers ---
  
  displayCategory(category: any): string {
    return category?.name || '';
  }

  private _filterByName<T extends { name: string }>(items: T[], name: string): T[] {
    const filterValue = name.toLowerCase();
    return items.filter(item => item.name.toLowerCase().includes(filterValue));
  }
  
  // --- Admin Panel Methods ---

  toggleManagementPanel(): void {
    this.managementPanelVisible = !this.managementPanelVisible;
    if (this.managementPanelVisible) {
      this.loadManagementCategories();
    }
  }

  loadManagementCategories(): void {
    this.isMgmtLoading = true;
    this.mediaService.getMediaCategories().subscribe(cats => {
      this.mgmtCategories = cats;
      this.isMgmtLoading = false;
      this.selectedMgmtCategory = null;
      this.mgmtSubCategories = [];
    });
  }

  selectCategoryForMgmt(category: MediaCategory): void {
    this.selectedMgmtCategory = category;
    this.isMgmtLoading = true;
    this.mediaService.getSubCategories(category.id).subscribe(subs => {
      this.mgmtSubCategories = subs;
      this.isMgmtLoading = false;
    });
  }

  addCategory(): void {
    const name = prompt('Enter new category name:');
    if (!name) return;
    this.mediaService.createCategory(name).subscribe({
      next: () => {
        this.snackBar.open('Category created.', 'Close', { duration: 2000 });
        this.loadManagementCategories();
        this.folderViewTrigger$.next(); // Refresh public view
      },
      error: err => this.snackBar.open(`Error: ${err.message}`, 'Close', { duration: 3000 })
    });
  }

  editCategory(category: MediaCategory): void {
    const newName = prompt('Enter new name for category:', category.name);
    if (!newName || newName === category.name) return;
    this.mediaService.updateCategory(category.id, newName).subscribe({
      next: () => {
        this.snackBar.open('Category updated.', 'Close', { duration: 2000 });
        this.loadManagementCategories();
        this.folderViewTrigger$.next(); // Refresh public view
      },
      error: err => this.snackBar.open(`Error: ${err.message}`, 'Close', { duration: 3000 })
    });
  }

  deleteCategory(category: MediaCategory): void {
    if (!confirm(`Are you sure you want to delete the category "${category.name}"? This will also delete all its sub-categories.`)) return;
    this.mediaService.deleteCategory(category.id).subscribe({
      next: () => {
        this.snackBar.open('Category deleted.', 'Close', { duration: 2000 });
        this.loadManagementCategories();
        this.folderViewTrigger$.next(); // Refresh public view
      },
      error: err => this.snackBar.open(`Error: ${err.message}`, 'Close', { duration: 3000 })
    });
  }

  addSubCategory(): void {
    if (!this.selectedMgmtCategory) return;
    const name = prompt(`Enter new sub-category name for "${this.selectedMgmtCategory.name}":`);
    if (!name) return;
    this.mediaService.createSubCategory(this.selectedMgmtCategory.id, name).subscribe({
      next: () => {
        this.snackBar.open('Sub-category created.', 'Close', { duration: 2000 });
        this.selectCategoryForMgmt(this.selectedMgmtCategory!);
      },
      error: err => this.snackBar.open(`Error: ${err.message}`, 'Close', { duration: 3000 })
    });
  }

  editSubCategory(subCategory: MediaSubCategory): void {
    const newName = prompt('Enter new name for sub-category:', subCategory.name);
    if (!newName || newName === subCategory.name) return;
    this.mediaService.updateSubCategory(subCategory.id, newName).subscribe({
      next: () => {
        this.snackBar.open('Sub-category updated.', 'Close', { duration: 2000 });
        this.selectCategoryForMgmt(this.selectedMgmtCategory!);
      },
      error: err => this.snackBar.open(`Error: ${err.message}`, 'Close', { duration: 3000 })
    });
  }

  deleteSubCategory(subCategory: MediaSubCategory): void {
    if (!confirm(`Are you sure you want to delete the sub-category "${subCategory.name}"?`)) return;
    this.mediaService.deleteSubCategory(subCategory.id).subscribe({
      next: () => {
        this.snackBar.open('Sub-category deleted.', 'Close', { duration: 2000 });
        this.selectCategoryForMgmt(this.selectedMgmtCategory!);
      },
      error: err => this.snackBar.open(`Error: ${err.message}`, 'Close', { duration: 3000 })
    });
  }
}
