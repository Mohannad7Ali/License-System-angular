import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css',
})
export class LandingComponent {
  // ميزات وإحصائيات مستخرجة ومصممة من وثيقة DVLD
  features = [
    {
      icon: 'fa-id-card-o',
      title: '7 فئات للرخص',
      desc: 'من الدراجات إلى الشاحنات الثقيلة',
    },
    {
      icon: 'fa-check-circle-o',
      title: '3 اختبارات متتالية',
      desc: 'فحص النظر، النظري، والعملي',
    },
    {
      icon: 'fa-bolt',
      title: 'إصدار سريع',
      desc: 'رسوم طلب موحدة بـ 5$ فقط',
    },
    {
      icon: 'fa-globe',
      title: 'رخصة دولية',
      desc: 'اصدار فوري لحاملي الفئة الثالثة',
    },
  ];
}
