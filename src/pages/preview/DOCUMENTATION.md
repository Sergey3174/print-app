# 📋 Современная система выбора страниц для печати

## ✨ Возможности

### 🔄 Два режима печати
1. **All Pages** - печать всех страниц документа
2. **Custom Range** - выбор конкретных страниц

### 📄 Методы выбора страниц в Custom режиме

#### Метод 1: Числовые поля (From / To)
- Простой выбор диапазона через две поля ввода
- Автоматическая валидация минимального/максимального значений
- Удобно для мобильных устройств

#### Метод 2: Расширенный формат
- Поддерживает сложные комбинации:
  - `1-5` - диапазон от 1 до 5
  - `1-5,8` - диапазон 1-5 и страница 8
  - `1-5,8,10-12` - несколько диапазонов и отдельные страницы

### 💰 Интеллектуальный расчет стоимости
- Стоимость рассчитывается **только** для выбранных страниц
- Показывает количество выбранных страниц
- Обновляется в реальном времени

### ⚠️ Валидация
- Ошибки отображаются в красном блоке
- Кнопка "Continue" отключена при ошибке
- Понятные сообщения об ошибках

## 🏗️ Структура проекта

```
src/pages/preview/
├── Preview.tsx          # Главный компонент
├── parsePages.ts        # Функция парсинга диапазонов
└── [изображения]
```

## 📝 Функция parsePages()

### Сигнатура
```typescript
function parsePages(input: string, maxPage: number): number[] | null
```

### Параметры
- `input` (string) - Строка с форматом страниц
- `maxPage` (number) - Максимальный номер страницы в документе

### Возвращаемое значение
- `number[]` - Отсортированный массив уникальных номеров страниц
- `null` - Если ввод некорректен

### Примеры

```typescript
// Простой диапазон
parsePages("1-5", 10) 
// → [1, 2, 3, 4, 5]

// Смешанный формат
parsePages("1-3,5,8-10", 12) 
// → [1, 2, 3, 5, 8, 9, 10]

// С пробелами
parsePages("1 - 5, 8, 10 - 12", 15) 
// → [1, 2, 3, 4, 5, 8, 10, 11, 12]

// Некорректный ввод
parsePages("5-3", 10) 
// → null (start > end)

parsePages("1-15", 10) 
// → null (выходит за границы)

parsePages("invalid", 10) 
// → null
```

## 🎨 UI/UX компоненты

### Основной экран
```
Pages [All Pages / Custom] ← Toggle
└─ Selected: 1, 2, 3... (только для Custom)
```

### Меню настройки (SettingsEditorSheet)
```
📄 Select Pages
├─ Print Mode [All Pages] [Custom Range]
└─ Custom Range (если выбран Custom):
   ├─ Method 1: Range
   │  ├─ From: [input 1-10]
   │  └─ To:   [input 1-10]
   ├─ Method 2: Custom Format
   │  └─ [input] (e.g., 1-5, 1-5,8, 1-5,8,10-12)
   ├─ Error Message (если есть ошибка)
   └─ Selection Summary (если ввод корректен)
```

## 📊 Расчет стоимости

```typescript
// Если All Pages
selectedPages = [1, 2, 3, ..., N]
selectedPagesCount = totalPages

// Если Custom
selectedPages = parsePages(input, totalPages)
selectedPagesCount = selectedPages.length

// Итоговая стоимость
totalPrice = pricePerPage * selectedPagesCount
```

## 🔍 State Management

```typescript
// Режим выбора
const [pageMode, setPageMode] = useState<"all" | "custom">("all")

// Числовые поля (Method 1)
const [rangeStart, setRangeStart] = useState(1)
const [rangeEnd, setRangeEnd] = useState(1)

// Текстовое поле (Method 2)
const [pageRangeInput, setPageRangeInput] = useState("")

// UI состояние
const [isPageSheetOpen, setIsPageSheetOpen] = useState(false)

// Вычисленные значения
const selectedPages = useMemo(() => {
  if (pageMode === "all") {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  // Custom logic...
}, [pageMode, pageRangeInput, rangeStart, rangeEnd, totalPages])
```

## 🎯 Использование в главном компоненте

```tsx
// Показ выбранных страниц на основном экране
{pageMode === "custom" && selectedPages.length > 0 && (
  <div className="bg-blue-50 rounded-lg p-3">
    <span className="font-medium">Selected:</span>
    <span className="font-bold">{selectedPages.join(", ")}</span>
  </div>
)}

// Расчет стоимости
<p className="text-xl font-semibold">${totalPrice}</p>

// Кнопка отключена при ошибке
<button disabled={rangeError !== null && pageMode === "custom"}>
  Continue
</button>
```

## 🚀 Установка и интеграция

1. Функция `parsePages` находится в `src/pages/preview/parsePages.ts`
2. Компонент `Preview` находится в `src/pages/preview/Preview.tsx`
3. Используется существующий компонент `SettingsEditorSheet` из профиля

## 🎓 Примеры тестирования

```typescript
// Test: Valid range
expect(parsePages("1-5", 10)).toEqual([1, 2, 3, 4, 5])

// Test: Mixed format
expect(parsePages("1-3,5,8-10", 12)).toEqual([1, 2, 3, 5, 8, 9, 10])

// Test: Single pages
expect(parsePages("1,3,5", 10)).toEqual([1, 3, 5])

// Test: Out of bounds
expect(parsePages("15-20", 10)).toBeNull()

// Test: Invalid format
expect(parsePages("invalid", 10)).toBeNull()

// Test: Start > End
expect(parsePages("5-3", 10)).toBeNull()
```

## 🎨 TailwindCSS классы

- `bg-blue-50 / border-blue-200` - Информационные блоки
- `bg-green-50 / border-green-200` - Успешный выбор
- `bg-red-50 / border-red-200` - Ошибки
- `focus:ring-blue-500` - Фокус на инпутах
- `disabled:opacity-50` - Отключенное состояние

## 📱 Mobile-first дизайн
- Все компоненты адаптированы для мобильных устройств
- Используются стандартные высоты элементов iOS/Android (44px+)
- Удобные, крупные кнопки и инпуты
- Понятная визуальная иерархия

---

**Готово к использованию! 🎉**
