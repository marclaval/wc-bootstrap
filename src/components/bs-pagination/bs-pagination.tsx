import {Component, Prop, Event, EventEmitter, State} from '@stencil/core';
import {getValueInRange, isNumber} from '@ng-bootstrap/ng-bootstrap/util/util';

@Component({
  tag: 'bs-pagination'
})
export class Pagination {
  @State() pageCount = 0;
  @State() pages: number[] = [];
  @State() page: number = 0;

  /**
   * Whether to disable buttons from user input
   */
  @Prop() disabled: boolean = false;

  /**
   *  Whether to show the "First" and "Last" page links
   */
  @Prop() boundaryLinks: boolean = false;

  /**
   *  Whether to show the "Next" and "Previous" page links
   */
  @Prop() directionLinks: boolean = true;

  /**
   *  Whether to show ellipsis symbols and first/last page numbers when maxSize > number of pages
   */
  @Prop() ellipses: boolean = true;

  /**
   *  Whether to rotate pages when maxSize > number of pages.
   *  Current page will be in the middle
   */
  @Prop() rotate: boolean = false;

  /**
   *  Number of items in collection.
   */
  @Prop() collectionSize: number;

  /**
   *  Maximum number of pages to display.
   */
  @Prop() maxSize: number = 0;

  /**
   *  Number of items per page.
   */
  @Prop() pageSize: number = 10;

  /**
   *  An event fired when the page is changed.
   *  Event's payload equals to the newly selected page.
   */
  @Event() pageChange: EventEmitter;

  /**
   * Pagination display size: small or large
   */
  @Prop() size: 'sm' | 'lg';

  render() {
    this._updatePages(this.page);
    return (
      <ul class={'pagination' + (this.size ? ' pagination-' + this.size : '')}>
        {this.boundaryLinks &&
        <li class={'page-item' + (!this.hasPrevious() || this.disabled ? ' disabled' : '')}>
          <a aria-label="First" class="page-link" href="" onClick={ (event) => this.selectPage(event, 1) } tabindex={(this.hasPrevious() ? null : '-1')}>
            <span aria-hidden="true">&laquo;&laquo;</span>
          </a>
        </li>
        }

        {this.directionLinks &&
        <li class={'page-item' + (!this.hasPrevious() || this.disabled ? ' disabled' : '')}>
          <a aria-label="Previous" class="page-link" href="" onClick={ (event) => this.selectPage(event, this.page - 1) } tabindex={(this.hasPrevious() ? null : '-1')}>
            <span aria-hidden="true">&laquo;</span>
          </a>
        </li>
        }

        {this.pages.map((pageNumber) => {
          return (<li class={'page-item' + (pageNumber === this.page ? ' active' : '') + (this.isEllipsis(pageNumber) || this.disabled ? ' disabled' : '')}>
            {this.isEllipsis(pageNumber)
              ? <a class="page-link">...</a>
              : <a class="page-link" href="" onClick={ (event) => this.selectPage(event, pageNumber) }>
                  {pageNumber}
                  {pageNumber === this.page &&
                    <span class="sr-only">(current)</span>
                  }
                </a>
            }
          </li>);
        })
        }

        {this.directionLinks &&
        <li class={'page-item' + (!this.hasNext() || this.disabled ? ' disabled' : '')}>
          <a aria-label="Next" class="page-link" href="" onClick={ (event) => this.selectPage(event, this.page + 1) } tabindex={(this.hasNext() ? null : '-1')}>
            <span aria-hidden="true">&raquo;</span>
          </a>
        </li>
        }

        {this.boundaryLinks &&
        <li class={'page-item' + (!this.hasNext() || this.disabled ? ' disabled' : '')}>
          <a aria-label="Last" class="page-link" href="" onClick={ (event) => this.selectPage(event, this.pageCount) } tabindex={(this.hasNext() ? null : '-1')}>
            <span aria-hidden="true">&raquo;&raquo;</span>
          </a>
        </li>
        }
      </ul>
    );
  }

  hasPrevious(): boolean { return this.page > 1; }

  hasNext(): boolean { return this.page < this.pageCount; }

  selectPage(event: UIEvent, pageNumber: number): void {
    event.preventDefault();
    this._updatePages(pageNumber);
  }

  componentWillUpdate(): void { this._updatePages(this.page); }

  isEllipsis(pageNumber): boolean { return pageNumber === -1; }

  /**
   * Appends ellipses and first/last page number to the displayed pages
   */
  private _applyEllipses(start: number, end: number) {
    if (this.ellipses) {
      if (start > 0) {
        if (start > 1) {
          this.pages.unshift(-1);
        }
        this.pages.unshift(1);
      }
      if (end < this.pageCount) {
        if (end < (this.pageCount - 1)) {
          this.pages.push(-1);
        }
        this.pages.push(this.pageCount);
      }
    }
  }

  /**
   * Rotates page numbers based on maxSize items visible.
   * Currently selected page stays in the middle:
   *
   * Ex. for selected page = 6:
   * [5,*6*,7] for maxSize = 3
   * [4,5,*6*,7] for maxSize = 4
   */
  private _applyRotation(): [number, number] {
    let start = 0;
    let end = this.pageCount;
    let leftOffset = Math.floor(this.maxSize / 2);
    let rightOffset = this.maxSize % 2 === 0 ? leftOffset - 1 : leftOffset;

    if (this.page <= leftOffset) {
      // very beginning, no rotation -> [0..maxSize]
      end = this.maxSize;
    } else if (this.pageCount - this.page < leftOffset) {
      // very end, no rotation -> [len-maxSize..len]
      start = this.pageCount - this.maxSize;
    } else {
      // rotate
      start = this.page - leftOffset - 1;
      end = this.page + rightOffset;
    }

    return [start, end];
  }

  /**
   * Paginates page numbers based on maxSize items per page
   */
  private _applyPagination(): [number, number] {
    let page = Math.ceil(this.page / this.maxSize) - 1;
    let start = page * this.maxSize;
    let end = start + this.maxSize;

    return [start, end];
  }

  private _setPageInRange(newPageNo) {
    const prevPageNo = this.page;
    this.page = getValueInRange(newPageNo, this.pageCount, 1);

    if (this.page !== prevPageNo) {
      this.pageChange.emit(this.page);
    }
  }

  private _updatePages(newPage: number) {
    this.pageCount = Math.ceil(this.collectionSize / this.pageSize);

    if (!isNumber(this.pageCount)) {
      this.pageCount = 0;
    }

    // fill-in model needed to render pages
    this.pages.length = 0;
    for (let i = 1; i <= this.pageCount; i++) {
      this.pages.push(i);
    }

    // set page within 1..max range
    this._setPageInRange(newPage);

    // apply maxSize if necessary
    if (this.maxSize > 0 && this.pageCount > this.maxSize) {
      let start = 0;
      let end = this.pageCount;

      // either paginating or rotating page numbers
      if (this.rotate) {
        [start, end] = this._applyRotation();
      } else {
        [start, end] = this._applyPagination();
      }

      this.pages = this.pages.slice(start, end);

      // adding ellipses
      this._applyEllipses(start, end);
    }
  }

}
