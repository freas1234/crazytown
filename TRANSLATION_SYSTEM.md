# نظام إدارة الترجمات - Translation Management System

## نظرة عامة

تم تحويل نظام إدارة الترجمات من ملفات JSON إلى قاعدة بيانات MongoDB لتحسين الأداء والمرونة في إدارة الترجمات.

## الميزات الجديدة

### 1. تخزين قاعدة البيانات
- جميع الترجمات محفوظة في MongoDB
- دعم للبحث المتقدم والتصفية
- إحصائيات مفصلة عن حالة الترجمات
- نسخ احتياطي تلقائي

### 2. API محسن
- `GET /api/translations?lang={language}` - جلب الترجمات للغة محددة
- `GET /api/admin/content/translations?language={language}` - جلب الترجمات للإدارة
- `PUT /api/admin/content/translations` - تحديث الترجمات
- `GET /api/admin/content/translations/search?q={query}` - البحث في الترجمات
- `GET /api/admin/content/translations/stats` - إحصائيات الترجمات

### 3. واجهة إدارة محسنة
- عرض إحصائيات الترجمات
- بحث متقدم
- عرض معدل اكتمال الترجمات
- إدارة أفضل للترجمات المفقودة

## التثبيت والتهيئة

### 1. تشغيل سكريبت الهجرة

```bash
# تشغيل سكريبت JavaScript
npm run migrate-translations

# أو تشغيل سكريبت TypeScript
npm run migrate-translations:ts
```

### 2. التحقق من التهيئة

تأكد من أن متغيرات البيئة التالية محددة:

```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/
MONGODB_DB=your_database_name
```

## هيكل قاعدة البيانات

### مجموعة الترجمات (translations collection)

```typescript
interface Translation {
  id: string;           // معرف فريد
  key: string;          // مفتاح الترجمة (مثل "common.loading")
  language: string;     // اللغة (en, ar)
  value: string;        // النص المترجم
  namespace?: string;   // مساحة الاسم (اختيارية)
  createdAt: Date;      // تاريخ الإنشاء
  updatedAt: Date;      // تاريخ آخر تحديث
}
```

## استخدام النظام

### 1. جلب الترجمات في الكود

```typescript
import { useTranslation } from '../lib/hooks/useTranslation';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.loading')}</h1>
      <p>{t('store.title')}</p>
    </div>
  );
}
```

### 2. إدارة الترجمات من لوحة الإدارة

1. انتقل إلى `/admin/content/translations`
2. اختر اللغة المراد تعديلها
3. قم بتعديل الترجمات
4. احفظ التغييرات

### 3. البحث في الترجمات

```typescript
// البحث في جميع الترجمات
const response = await fetch('/api/admin/content/translations/search?q=loading');

// البحث في لغة محددة
const response = await fetch('/api/admin/content/translations/search?q=loading&language=en');
```

## الصيانة

### 1. إضافة ترجمة جديدة

```typescript
import { db } from '../lib/db';

// إضافة ترجمة جديدة
await db.translations.upsert('new.key', 'en', 'New Translation');
await db.translations.upsert('new.key', 'ar', 'ترجمة جديدة');
```

### 2. حذف ترجمة

```typescript
// حذف ترجمة محددة
await db.translations.delete('old.key', 'en');

// حذف جميع ترجمات لغة معينة
await db.translations.deleteByLanguage('en');
```

### 3. جلب إحصائيات

```typescript
const stats = await fetch('/api/admin/content/translations/stats');
const data = await stats.json();
console.log(data.stats);
```

## استكشاف الأخطاء

### 1. مشاكل الاتصال بقاعدة البيانات

```bash
# تحقق من اتصال MongoDB
mongosh "mongodb+srv://username:password@cluster.mongodb.net/database"
```

### 2. مشاكل في تحميل الترجمات

- تحقق من أن API يعمل بشكل صحيح
- تأكد من صحة متغيرات البيئة
- راجع سجلات الخادم للأخطاء

### 3. مشاكل في الهجرة

```bash
# تشغيل الهجرة مرة أخرى
npm run migrate-translations

# أو حذف الترجمات الموجودة وإعادة الهجرة
```

## الأداء

### 1. التخزين المؤقت
- يتم تخزين الترجمات مؤقتاً في الذاكرة
- إعادة تحميل الترجمات عند تغيير اللغة فقط

### 2. التحسينات
- استخدام bulk operations للتحديثات المتعددة
- فهرسة على `key` و `language` للبحث السريع
- ضغط البيانات لتوفير المساحة

## الأمان

### 1. التحكم في الوصول
- جميع عمليات الإدارة تتطلب صلاحيات admin أو owner
- التحقق من الجلسة قبل كل عملية

### 2. التحقق من صحة البيانات
- التحقق من صحة مفاتيح الترجمات
- تنظيف البيانات المدخلة
- حماية من SQL injection

## الدعم

للمساعدة أو الإبلاغ عن مشاكل، يرجى التواصل مع فريق التطوير.
