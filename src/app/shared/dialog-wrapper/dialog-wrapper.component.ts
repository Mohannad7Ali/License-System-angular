import {
  Component,
  Input,
  Output,
  EventEmitter,
  inject,
  ElementRef,
} from '@angular/core';
import { Location } from '@angular/common';

@Component({
  selector: 'app-dialog-wrapper',
  standalone: true,
  imports: [],
  templateUrl: './dialog-wrapper.component.html',
  styleUrl: './dialog-wrapper.component.css',
})
export class DialogWrapperComponent {
  @Input() title!: string;
  @Output() close = new EventEmitter<void>();

  private location = inject(Location);
  private elementRef = inject(ElementRef);

  onClose() {
    // 1. إطلاق الحدث للأب في حال كان هناك أي كود خاص معتمد عليه
    this.close.emit();

    // 2. إغلاق النافذة فوراً عبر إزالة العنصر من الـ DOM
    const hostElement = this.elementRef.nativeElement as HTMLElement;
    if (hostElement) {
      hostElement.style.display = 'none';
    }

    // 3. التراجع في المسار (للروات المعروضة عبر Router Outlet / Dialog)
    // نتحقق من أن المتصفح يتيح العودة للخلف
    try {
      this.location.back();
    } catch (e) {
      // إهمال أي خطأ في حال عدم وجود مسار سابق
    }
  }
}
