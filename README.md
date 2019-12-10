
# ItmmBot

Time table parser

## Install bot (Windows)

Bot install guide

1. Install nodejs and python
2. Install vs code
3. Open repository folder
4. Run npm install
5. Run bot.js
6. Have fun

## Patch 1.5 (Magic)

Первый масштабный патч. Добавляет функционал мониторинга за ботом, и быстрого исправления ошибок на продакшене.  

Исправлены ошибки:

+ Неправильное обновление расписания
+ Добавлен "мягкий" обход скрытых столбцов в xls файле
+ Полное молчание относительно обновления расписания

User-side изменения:

1. Добавлен просмотр магистратуры
2. Убраны бесячие сообщения с подколами при ошибке
3. Убрана бесполезная команда "настройки"

Admin-side изменения:

1. Добавлена страница отслеживания поведения бота
2. Добавлена страница отслеживания базы данных
3. Добавлена страница отслеживания данных, и форсированного обновления оных
4. Переписан парсер
5. Добавлены более гибкие настройки парсера под каждый документ с расписанием

14.10.2019

## Patch 1.6 (Snowfall)

Небольшой патч, добавляющий функционал, для удобного просмотра предметов, которые необходимо выучить к зимней сессии.

Исправлены ошибки:

+ Получение расписания
+ Перегон расписания из .xls файла в json

User-side изменения:

1. При написании комманды "Сессия" пользователь получает список предметов для зимней отчетности
2. Если написать комманду "Игра", то можно поиграть в висилецу (это был пиар хода, но чет сроки сгорели)
3. Добавлена панель с донатами на разработку бота (но никто ей не пользуется....)
4. Переработаны некоторые диалоги бота, полностью вырезан функионал настроек (спорим, ты даже о таком не знал?)

Admin-side изменения:

1. Новая страница, для создания и редактирования списка экзаменов
2. Вроде все
3. Просто это звучит просто, но работы много было :)
4. Нужно было сделать список побольше...

Баги:

1. Небольшой косяк с разницей во времени на админской странице. Он не мешает корректной работе и является чисто визуальным (скоро будет исправлен)

![picture](/media/snowfall.gif)
