/**
 * Функция для расчета выручки
 * @param purchase запись о покупке
 * @param _product карточка товара
 * @returns {number}
 */
function calculateSimpleRevenue(purchase, _product) {
   // @TODO: Расчет выручки от операции
   const { discount, sale_price, quantity } = purchase;
   const revenue = sale_price * (1 - (discount / 100)) * quantity;
   return revenue
}

/**
 * Функция для расчета бонусов
 * @param index порядковый номер в отсортированном массиве
 * @param total общее число продавцов
 * @param seller карточка продавца
 * @returns {number}
 */
function calculateBonusByProfit(index, total, seller) {
    // @TODO: Расчет бонуса от позиции в рейтинге
    const { profit } = seller;
    let bonus = 0;
    if (index === 0) {
        return bonus = profit * 0.15
    }

    else if (index === 1 || index === 2) {
        return bonus = profit * 0.10
    }

    else if (index === total - 1) {
        return 0;
    }

    else {
        return bonus = profit * 0.05
    }
}

/**
 * Функция для анализа данных продаж
 * @param data
 * @param options
 * @returns {{revenue, top_products, bonus, name, sales_count, profit, seller_id}[]}
 */
function analyzeSalesData(data, options) { 
    // @TODO: Проверка входных данных
    if (!data
        || !Array.isArray(data.sellers)
        || data.sellers.length === 0
        ) {
        throw new Error('Некорректные входные данные');
    }

    // @TODO: Проверка наличия опций
    const { calculateRevenue, calculateBonus } = options;
    if (!calculateRevenue
        || !calculateBonus
        ) {
        throw new Error('Расчетные функции не переданы');
    }

    if (!(typeof(calculateBonus) === "function" 
        && typeof(calculateRevenue === "function"))
        ) {
        throw new Error('Ошибка типа переданных расчетных функций');
    }

    // @TODO: Подготовка промежуточных данных для сбора статистики
    const sellerStats = data.sellers.map(seller => ({
        seller_id: seller.id,
        name: `${seller.first_name} ${seller.last_name}`,
    }));

    // @TODO: Индексация продавцов и товаров для быстрого доступа
    const sellerIndex = Object.fromEntries(sellerStats.map(item => [item.seller_id, item]));
    const productIndex = Object.fromEntries(data.products.map(item => [item.sku, item]));

    // @TODO: Расчет выручки и прибыли для каждого продавца
    data.purchase_records.forEach(record => {
        const seller = sellerIndex[record.seller_id];
        if (!seller.sales_count) {
            seller.sales_count = 0
        }
        if (!seller.revenue) {
            seller.revenue = 0;
        }
        if (!seller.profit) {
            seller.profit = 0;
        }
        if (!seller.products_sold) {
            seller.products_sold = {}
        }
        seller.sales_count += 1;
        seller.revenue += record.total_amount;

        record.items.forEach(item => {
            const product = productIndex[item.sku];
            const cost = product.purchase_price * item.quantity;
            const revenue = calculateSimpleRevenue(item);
            const profit = revenue - cost;
            seller.profit += profit;
            if (!seller.products_sold[item.sku]) {
                seller.products_sold[item.sku] = 0;
            }
            seller.products_sold[item.sku] += 1;
        });
    });

    // @TODO: Сортировка продавцов по прибыли
    sellerStats.sort((a, b) => b.profit - a.profit);

    // @TODO: Назначение премий на основе ранжирования
    sellerStats.forEach((seller, index) => {
        seller.bonus = calculateBonusByProfit(index, sellerStats.length, seller);// Считаем бонус
        seller.top_products = Object.entries(seller.products_sold).map(([sku, quantity]) => ({ sku, quantity })).sort((a, b) => b.quantity - a.quantity).slice(0, 10);// Формируем топ-10 товаров
    });
    // @TODO: Подготовка итоговой коллекции с нужными полями
    return sellerStats.map(seller => ({
        seller_id: seller.seller_id,
        name: seller.name,
        revenue: +seller.revenue.toFixed(2),
        profit: +seller.profit.toFixed(2),
        sales_count: seller.sales_count,
        top_products: seller.top_products,
        bonus: +seller.bonus.toFixed(2)
    }));
}
