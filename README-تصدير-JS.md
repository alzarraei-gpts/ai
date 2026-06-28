# تعديل زر تصدير JS

استبدل الملفين التاليين داخل مشروعك:

```text
admin.html
js/data-service.js
```

بعد الاستبدال افتح لوحة التحكم واضغط Ctrl + F5.

سيظهر زر جديد باسم: **تصدير JS**.

وظيفته تصدير الملف مباشرة باسم:

```text
research-dynamic-data.js
```

وبداخله الصيغة:

```javascript
window.RESEARCH_DATA = {...};
```

بعد التصدير، استبدل الملف القديم داخل:

```text
data/research-dynamic-data.js
```

بهذا الملف الجديد.
