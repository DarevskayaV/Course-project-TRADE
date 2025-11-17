// =============================================================================
// ПОЛУЧЕНИЕ ССЫЛОК НА DOM-ЭЛЕМЕНТЫ
// =============================================================================

// document.getElementById() - метод, который находит элемент по его id
// Возвращает ссылку на DOM-элемент или null, если элемент не найден
const categorySelect = document.getElementById('categorySelect');
const sortSelect = document.getElementById('sortSelect');

// document.querySelector() - более универсальный метод, который использует CSS-селекторы
// '#productTable tbody' означает: "найти tbody внутри элемента с id productTable"
// querySelector возвращает ПЕРВЫЙ найденный элемент
const productTableBody = document.querySelector('#productTable tbody');

// =============================================================================
// ФУНКЦИЯ РЕНДЕРИНГА ТОВАРОВ В ТАБЛИЦУ
// =============================================================================

/**
 * Функция для отображения списка товаров в таблице
 * @param {Array} products - массив объектов товаров для отображения
 */
function renderProducts(products) {
  // Очищаем содержимое tbody перед добавлением новых данных
  // innerHTML - свойство, которое содержит HTML-содержимое элемента
  // Присвоение пустой строки удаляет все дочерние элементы
  productTableBody.innerHTML = '';
  
  // forEach - метод массива, который выполняет функцию для каждого элемента
  // products.forEach(product => { ... }) аналогично:
  // for(let i = 0; i < products.length; i++) { const product = products[i]; ... }
  products.forEach(product => {
    // document.createElement() - создает новый HTML-элемент
    // 'tr' создает строку таблицы (table row)
    const row = document.createElement('tr');
    
    // Заполняем строку HTML-содержимым
    // Шаблонная строка (обратные кавычки ``) позволяет вставлять переменные через ${}
    row.innerHTML = `
      <td><img src="${product.image}" alt="${product.name}"></td>
      <td>${product.name}</td>
      <td>${product.price}</td>
      <td>${product.category}</td>
    `;
    // <td> - ячейка таблицы (table data)
    // <img> - тег изображения с атрибутами src (источник) и alt (альтернативный текст)
    
    // appendChild() - добавляет элемент как последнего ребенка родительского элемента
    productTableBody.appendChild(row);
  });
}

// =============================================================================
// ФУНКЦИЯ ПОЛУЧЕНИЯ ВСЕХ ТОВАРОВ С КАТЕГОРИЯМИ
// =============================================================================

/**
 * Преобразует структуру productStore в плоский массив товаров
 * @returns {Array} - массив всех товаров с добавленным свойством category
 */
function getAllProductsWithCategory() {
  // Создаем пустой массив для накопления результатов
  const allProducts = [];
  
  // Object.entries() - преобразует объект в массив пар [ключ, значение]
  // Например: {fruits: [...], drinks: [...]} -> [['fruits', [...]], ['drinks', [...]]]
  // Деструктуризация [category, items] - извлекает ключ и значение из каждой пары
  for (const [category, items] of Object.entries(productStore.categories)) {
    // Для каждого товара в категории добавляем его в общий массив
    items.forEach(item => {
      // Оператор spread (...) копирует все свойства из item и добавляет category
      // { ...item, category } создает новый объект с теми же свойствами + category
      allProducts.push({ ...item, category });
    });
  }
  
  return allProducts;
}

// =============================================================================
// ИНИЦИАЛИЗАЦИЯ ВЫПАДАЮЩЕГО СПИСКА КАТЕГОРИЙ
// =============================================================================

/**
 * Заполняет выпадающий список категориями из productStore
 */
function initCategorySelect() {
  // Object.keys() - возвращает массив ключей объекта
  // Например: {fruits: [...], drinks: [...]} -> ['fruits', 'drinks']
  Object.keys(productStore.categories).forEach(cat => {
    // Создаем новый элемент <option> для выпадающего списка
    const option = document.createElement('option');
    
    // value - значение, которое будет отправлено на сервер при выборе
    option.value = cat;
    
    // textContent - текстовое содержимое, которое увидит пользователь
    option.textContent = cat;
    
    // Добавляем созданную опцию в выпадающий список
    categorySelect.appendChild(option);
  });
}

// =============================================================================
// ФУНКЦИИ СОРТИРОВКИ
// =============================================================================

/**
 * Сортирует массив товаров по выбранному критерию
 * @param {Array} products - массив товаров для сортировки
 * @param {string} sortType - тип сортировки
 * @returns {Array} - отсортированный массив
 */
function sortProducts(products, sortType) {
  // switch - оператор множественного выбора, альтернатива if/else if
  switch(sortType) {
    case 'priceAsc': // Сортировка по цене по возрастанию
      // array.sort() - метод сортировки массива
      // (a, b) => parseFloat(a.price) - parseFloat(b.price) - функция сравнения
      // Если результат отрицательный - a идет перед b
      // Если положительный - b идет перед a
      // Если 0 - порядок не меняется
      // parseFloat() преобразует строку в число, игнорируя нечисловые символы
      return products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    
    case 'priceDesc': // Сортировка по цене по убыванию
      // Обратный порядок: b.price - a.price
      return products.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
    
    case 'alphaAsc': // Сортировка по названию A-Z
      // string.localeCompare() - сравнивает строки с учетом локали
      // Возвращает отрицательное число если a < b, положительное если a > b, 0 если равны
      return products.sort((a, b) => a.name.localeCompare(b.name));
    
    case 'alphaDesc': // Сортировка по названию Z-A
      // Обратный порядок: b.name.localeCompare(a.name)
      return products.sort((a, b) => b.name.localeCompare(a.name));
    
    default: // Если тип сортировки не распознан - возвращаем исходный массив
      return products;
  }
}

// =============================================================================
// ОСНОВНАЯ ФУНКЦИЯ ОБНОВЛЕНИЯ ДАННЫХ
// =============================================================================

/**
 * Главная функция: фильтрует, сортирует и отображает товары
 * Вызывается при изменении фильтров или загрузке страницы
 */
function updateProducts() {
  // 1. Получаем все товары с категориями
  let products = getAllProductsWithCategory();

  // 2. ФИЛЬТРАЦИЯ ПО КАТЕГОРИИ
  // selectElement.value - возвращает значение выбранной опции
  const selectedCategory = categorySelect.value;
  
  // Если выбрана не "все категории", применяем фильтр
  if (selectedCategory !== 'all') {
    // array.filter() - создает новый массив с элементами, прошедшими проверку
    // p => p.category === selectedCategory - функция-предикат
    // Возвращает true для товаров, у которых категория совпадает с выбранной
    products = products.filter(p => p.category === selectedCategory);
  }

  // 3. СОРТИРОВКА
  // Получаем выбранный тип сортировки
  const sortType = sortSelect.value;
  // Сортируем отфильтрованный массив
  products = sortProducts(products, sortType);

  // 4. ОТОБРАЖЕНИЕ
  // Передаем обработанный массив в функцию рендеринга
  renderProducts(products);
}

// =============================================================================
// ИНИЦИАЛИЗАЦИЯ ПРИ ЗАГРУЗКЕ СТРАНИЦЫ
// =============================================================================

// Вызываем функции при загрузке скрипта
initCategorySelect();   // Заполняем выпадающий список категориями
updateProducts();       // Первоначальное отображение товаров

// =============================================================================
// НАСТРОЙКА ОБРАБОТЧИКОВ СОБЫТИЙ
// =============================================================================

// element.addEventListener() - назначает обработчик события
// 'change' - событие, которое происходит при изменении значения элемента формы

// Когда пользователь меняет категорию - обновляем товары
categorySelect.addEventListener('change', updateProducts);

// Когда пользователь меняет сортировку - обновляем товары
sortSelect.addEventListener('change', updateProducts);