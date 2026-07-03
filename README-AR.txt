حزمة دمج الشعار وصورة واتساب — دون المساس بلوحة التحكم

المحتوى:
- assets/logo.png
- assets/whatsapp-preview.png
- assets/favicon.png
- apply-logo-and-preview.ps1

ماذا تفعل الحزمة؟
1) تنسخ الشعار إلى: images/logo.png
2) تنسخ صورة مشاركة واتساب إلى: images/whatsapp-preview.png
3) تنسخ الأيقونة إلى: images/favicon.png
4) تضيف وسوم Open Graph داخل index.html فقط.
5) تضيف الشعار تلقائيًا قبل العنوان الرئيسي الأول في الصفحة.
6) تحفظ نسخة احتياطية من index.html داخل: _backup_before_logo_patch
7) لا تعدل admin.html ولا لوحة التحكم.

طريقة التشغيل:
1) فك الضغط عن الحزمة.
2) افتح PowerShell من داخل مجلد الحزمة.
3) نفذ الأمر التالي:

powershell -ExecutionPolicy Bypass -File .\apply-logo-and-preview.ps1 -ProjectPath "C:\Users\zedni\OneDrive\Desktop\web\ai"

بعد ذلك:
- افتح index.html محليًا وتأكد من ظهور الشعار.
- افتح GitHub Desktop.
- اكتب رسالة Commit مثل: Add logo and WhatsApp preview
- اضغط Commit to main
- اضغط Push origin

تنبيه:
لا تنقل مجلد .git من ai-backup.
لا تحذف ai-backup إلا بعد التأكد من عمل الموقع ولوحة التحكم.
