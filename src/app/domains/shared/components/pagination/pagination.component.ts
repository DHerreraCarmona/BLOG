import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Pagination } from '@shared/models/pagination';

@Component({
  selector: 'app-pagination',
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  @Input() pagination!: Pagination | null;
  @Output() changePage = new EventEmitter<number>();

  paginated(dir: -1 | 1){
    if (!this.pagination){ return }
    const targetPage = this.pagination?.current_page + dir; 
    if (targetPage <= 0 || targetPage > this.pagination.total_pages){
      return
    }
    this.changePage.emit(targetPage);
  }
}
