


### 🎨 1. نظام الألوان (Color Palette)

- **اللون الرئيسي (Primary Accent):**
- **Violet / Indigo Gradient:** الدرجات مثل `Electric Violet` (`#4f46e5` / `#5a67ba` / `#4338ca`) لتحديد العناصر النشطة، الأزرار، والعناوين الفرعية.
- **Cyan / Neon Accent:** للحدود المضيئة والنصوص التي تحتاج بروزًا عاليًا.

- **الخلفيات (Backgrounds):**
- **Dark Mode / Deep Slate:** نعتمد على خلفيات قائمة على الداكن مثل Slate Navy (`#0f172a` أو `#1e293b`) والرماديات الداكنة العميقة لتعزيز طابع الـ Cyberpunk / High-Tech.
- في حال استخدام خلفيات فاتحة ناعمة للبطاقات، يتم الحفاظ على تباين قوي باستخدام الرمادي الداكن جدًا للنصوص (`#1e293b`).

- **حالات البيانات (Status Colors):**
- **Success / Active:** أخضر زمردي ناعم (`Emerald`: `#dcfce7` للخلفية مع `#15803d` للنص).
- **Warning / Pending:** الكهرماني (`Amber`: `#fef3c7` / `#d97706`).
- **Danger / Expired:** الأحمر الدافئ (`#fee2e2` للخلفية مع `#b91c1c` للنص).

---

### 🖌️ 2. الأسلوب والتأثيرات (Design Style)

- **Dark Neon Glossy / Glassmorphism:**
- تأثيرات زجاجية ناعمة، حدود مضيئة بلمسات نيون، وتدرجات لونية عصرية (Gradients).
- حواف دائرية واضحة للبطاقات والمكونات (`border-radius: 12px` إلى `16px`) مع ظلال ناعمة ودقيقة (`box-shadow`) لتأكيد طبقات الواجهة.

- **الكروت والحاويات (Cards & Modular Layout):**
- استخدام **كروت إحصائيات سريعة (Stats Cards)** في أعلى الصفحات توضح الأرقام الحيوية.
- تفكيك الواجهات المعقدة إلى قطاعات منظمة وواضحة (Clean Information Architecture).

---

### ⚡ 3. التفاعلية والحركة (Interactivity)

- **Micro-interactions:** حركات ناعمة وسريعة عند مرور الماوس (`transition: all 0.2s ease`) على الأزرار، الكروت، والـ Toggles.
- **CSS Variables & Tailwind Support:** الاعتماد على متغيرات CSS مجمعة لتسهيل التخصيص وإعادة الاستخدام عبر كامل الـ Dashboard.
