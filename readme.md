**Текущее обновление**

1. php artisan migrate
2. удалить директивы редиректа для Nginx связанные со скачкой старых файлов /uploads -> /uploads/posts
3. php artisan update:unread
4. php artisan cache:create