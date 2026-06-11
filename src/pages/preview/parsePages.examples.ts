/**
 * Примеры использования функции parsePages
 * 
 * Скопируйте эти примеры для тестирования в консоль браузера
 */

import { parsePages } from "./parsePages";

// ==================== ПРИМЕРЫ ====================

// Пример 1: Простой диапазон
console.log("Пример 1: Простой диапазон");
console.log(parsePages("1-5", 10)); // [1, 2, 3, 4, 5]

// Пример 2: Несколько диапазонов
console.log("\nПример 2: Несколько диапазонов");
console.log(parsePages("1-3,5-7", 10)); // [1, 2, 3, 5, 6, 7]

// Пример 3: Смешанный формат (из требований)
console.log("\nПример 3: Смешанный формат");
console.log(parsePages("1-3,5,8-10", 12)); // [1, 2, 3, 5, 8, 9, 10]

// Пример 4: Только отдельные страницы
console.log("\nПример 4: Только отдельные страницы");
console.log(parsePages("1,3,5,7,9", 10)); // [1, 3, 5, 7, 9]

// Пример 5: С пробелами
console.log("\nПример 5: С пробелами в вводе");
console.log(parsePages("1 - 5 , 8 , 10 - 12", 15)); // [1, 2, 3, 4, 5, 8, 10, 11, 12]

// ==================== ОШИБКИ ====================

console.log("\n--- ОШИБКИ ---");

// Ошибка 1: Диапазон обратный (start > end)
console.log("\nОшибка 1: Обратный диапазон");
console.log(parsePages("5-3", 10)); // null

// Ошибка 2: Страницы вне диапазона
console.log("\nОшибка 2: Страницы вне диапазона");
console.log(parsePages("1-15", 10)); // null (максимум 10 страниц)
console.log(parsePages("15-20", 10)); // null

// Ошибка 3: Некорректный формат
console.log("\nОшибка 3: Некорректный формат");
console.log(parsePages("invalid", 10)); // null
console.log(parsePages("1-a", 10)); // null
console.log(parsePages("a-5", 10)); // null

// Ошибка 4: Пустой ввод
console.log("\nОшибка 4: Пустой ввод");
console.log(parsePages("", 10)); // null
console.log(parsePages("   ", 10)); // null

// ==================== РЕАЛЬНЫЕ СЦЕНАРИИ ====================

console.log("\n--- РЕАЛЬНЫЕ СЦЕНАРИИ ---");

// Сценарий 1: Документ с 50 страницами
console.log("\nСценарий 1: 50 страниц - выбрать 1-10 и 45-50");
const scenario1 = parsePages("1-10,45-50", 50);
console.log(scenario1);
console.log(`Всего выбрано: ${scenario1?.length} страниц`);

// Сценарий 2: Нужны только первая, последняя и несколько в середине
console.log("\nСценарий 2: Первая, последняя и несколько в середине");
const scenario2 = parsePages("1,15,20,25,50", 50);
console.log(scenario2);
console.log(`Всего выбрано: ${scenario2?.length} страниц`);

// Сценарий 3: Сложная комбинация
console.log("\nСценарий 3: Сложная комбинация");
const scenario3 = parsePages("1-5,8,10-15,20,25-30", 50);
console.log(scenario3);
console.log(`Всего выбрано: ${scenario3?.length} страниц`);

// ==================== ИНТЕГРАЦИЯ С РАСЧЕТОМ СТОИМОСТИ ====================

console.log("\n--- ИНТЕГРАЦИЯ С РАСЧЕТОМ ---");

const totalPages = 100;
const pricePerPage = 2;

const testInputs = [
  "1-10",
  "1-10,50",
  "1-50",
  "1,3,5,7,9",
];

testInputs.forEach((input) => {
  const selected = parsePages(input, totalPages);
  if (selected) {
    const totalPrice = pricePerPage * selected.length;
    console.log(
      `\nВввод: "${input}"\nВыбрано: ${selected.length} стр.\nСтоимость: $${totalPrice}`
    );
  }
});
