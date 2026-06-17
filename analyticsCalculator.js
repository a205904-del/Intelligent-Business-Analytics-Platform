/**
 * Business Analytics Calculator Module
 * Calculates key metrics from parsed business data
 * Supports flexible column name detection (revenue, orders, products, profit, categories, dates)
 */

const AnalyticsCalculator = {
  /**
   * Calculate all metrics from data
   * @param {Array} rows - Array of data rows
   * @param {Array} columnHeaders - Array of column names
   * @returns {Object} Calculated metrics
   */
  calculateMetrics(rows, columnHeaders) {
    if (!rows || rows.length === 0) {
      return this.getDefaultMetrics();
    }

    // Find relevant columns (case-insensitive)
    const revenueColumn = this.findColumn(columnHeaders, ['revenue', 'sales', 'total', 'amount']);
    const ordersColumn = this.findColumn(columnHeaders, ['orders', 'quantity', 'count', 'qty']);
    const productColumn = this.findColumn(columnHeaders, ['product', 'name', 'item']);
    const profitColumn = this.findColumn(columnHeaders, ['profit', 'net', 'margin', 'earnings']);
    const categoryColumn = this.findColumn(columnHeaders, ['category', 'type', 'class', 'segment']);
    const dateColumn = this.findColumn(columnHeaders, ['date', 'month', 'time', 'period']);

    // Calculate basic metrics
    const totalRevenue = this.calculateTotalRevenue(rows, revenueColumn);
    const totalOrders = this.calculateTotalOrders(rows, ordersColumn);
    const totalProfit = this.calculateTotalProfit(rows, profitColumn);
    const growthRate = this.calculateGrowthRate(rows, revenueColumn);
    const topProduct = this.findTopProduct(rows, productColumn, revenueColumn);
    
    // Calculate category-based metrics
    const categoryMetrics = this.calculateCategoryMetrics(rows, categoryColumn, revenueColumn, profitColumn);
    const topCategory = categoryMetrics.topCategory;
    const revenueByCategory = categoryMetrics.byRevenue;
    const profitByCategory = categoryMetrics.byProfit;

    // Calculate monthly trends
    const monthlyTrends = this.calculateMonthlyTrends(rows, dateColumn, revenueColumn, profitColumn);

    return {
      totalRevenue,
      totalProfit,
      totalOrders,
      growthRate,
      topProduct,
      topCategory,
      revenueByCategory,
      profitByCategory,
      monthlyTrends,
      dataFound: true
    };
  },

  /**
   * Find column name by looking for keywords (case-insensitive)
   * @param {Array} headers - Column headers to search
   * @param {Array} keywords - Keywords to match
   * @returns {string|null} Matching column name or null
   */
  findColumn(headers, keywords) {
    if (!headers || headers.length === 0) return null;

    for (const header of headers) {
      const lowerHeader = header.toLowerCase().trim();
      for (const keyword of keywords) {
        if (lowerHeader.includes(keyword.toLowerCase())) {
          return header;
        }
      }
    }
    return null;
  },

  /**
   * Calculate total revenue
   * @param {Array} rows - Data rows
   * @param {string} column - Column name containing revenue
   * @returns {number} Total revenue
   */
  calculateTotalRevenue(rows, column) {
    if (!column) return 0;

    return rows.reduce((sum, row) => {
      const value = this.parseNumber(row[column]);
      return sum + value;
    }, 0);
  },

  /**
   * Calculate total profit
   * @param {Array} rows - Data rows
   * @param {string} column - Column name containing profit
   * @returns {number} Total profit
   */
  calculateTotalProfit(rows, column) {
    if (!column) return 0;

    return rows.reduce((sum, row) => {
      const value = this.parseNumber(row[column]);
      return sum + value;
    }, 0);
  },

  /**
   * Calculate total orders
   * @param {Array} rows - Data rows
   * @param {string} column - Column name containing orders
   * @returns {number} Total orders (or row count if no specific column)
   */
  calculateTotalOrders(rows, column) {
    if (!column) {
      // If no orders column found, use row count
      return rows.length;
    }

    return rows.reduce((sum, row) => {
      const value = this.parseNumber(row[column]);
      return sum + value;
    }, 0);
  },

  /**
   * Calculate growth rate (percentage increase from first to last)
   * @param {Array} rows - Data rows
   * @param {string} column - Column name for calculation
   * @returns {number} Growth rate as percentage
   */
  calculateGrowthRate(rows, column) {
    if (!column || rows.length < 2) return 0;

    const firstValue = this.parseNumber(rows[0][column]);
    const lastValue = this.parseNumber(rows[rows.length - 1][column]);

    if (firstValue === 0) return 0;

    return parseFloat(
      (((lastValue - firstValue) / firstValue) * 100).toFixed(1)
    );
  },

  /**
   * Find top product (product with highest revenue/quantity)
   * @param {Array} rows - Data rows
   * @param {string} productColumn - Column name for products
   * @param {string} revenueColumn - Column name for revenue/quantity
   * @returns {string} Top product name
   */
  findTopProduct(rows, productColumn, revenueColumn) {
    if (!productColumn) return 'No Product Data';

    let topProduct = 'Unknown';
    let maxValue = 0;

    rows.forEach(row => {
      let value = 1; // Default value if no revenue column
      
      if (revenueColumn) {
        value = this.parseNumber(row[revenueColumn]);
      }

      if (value > maxValue) {
        maxValue = value;
        topProduct = row[productColumn] || 'Unknown';
      }
    });

    return topProduct;
  },

  /**
   * Calculate category-based metrics
   * @param {Array} rows - Data rows
   * @param {string} categoryColumn - Column name for categories
   * @param {string} revenueColumn - Column name for revenue
   * @param {string} profitColumn - Column name for profit
   * @returns {Object} Category metrics
   */
  calculateCategoryMetrics(rows, categoryColumn, revenueColumn, profitColumn) {
    const categoryData = {};
    
    rows.forEach(row => {
      const category = categoryColumn ? (row[categoryColumn] || 'Other') : 'All';
      
      if (!categoryData[category]) {
        categoryData[category] = {
          revenue: 0,
          profit: 0,
          count: 0
        };
      }

      if (revenueColumn) {
        categoryData[category].revenue += this.parseNumber(row[revenueColumn]);
      }
      if (profitColumn) {
        categoryData[category].profit += this.parseNumber(row[profitColumn]);
      }
      categoryData[category].count++;
    });

    // Find top category by revenue
    let topCategory = 'No Category Data';
    let maxRevenue = 0;
    
    const byRevenue = [];
    const byProfit = [];

    Object.entries(categoryData).forEach(([category, data]) => {
      byRevenue.push({ category, value: data.revenue });
      byProfit.push({ category, value: data.profit });
      
      if (data.revenue > maxRevenue) {
        maxRevenue = data.revenue;
        topCategory = category;
      }
    });

    // Sort by value (descending)
    byRevenue.sort((a, b) => b.value - a.value);
    byProfit.sort((a, b) => b.value - a.value);

    return {
      topCategory,
      byRevenue: byRevenue.slice(0, 5), // Top 5
      byProfit: byProfit.slice(0, 5)    // Top 5
    };
  },

  /**
   * Calculate monthly trend analysis
   * @param {Array} rows - Data rows
   * @param {string} dateColumn - Column name for dates
   * @param {string} revenueColumn - Column name for revenue
   * @param {string} profitColumn - Column name for profit
   * @returns {Array} Monthly trend data
   */
  calculateMonthlyTrends(rows, dateColumn, revenueColumn, profitColumn) {
    const monthlyData = {};

    rows.forEach(row => {
      let month = 'Unknown Month';
      
      if (dateColumn && row[dateColumn]) {
        try {
          const date = new Date(row[dateColumn]);
          if (!isNaN(date.getTime())) {
            month = date.toLocaleString('en-MY', { year: 'numeric', month: 'short' });
          }
        } catch (e) {
          // Keep default month
        }
      }

      if (!monthlyData[month]) {
        monthlyData[month] = {
          revenue: 0,
          profit: 0,
          count: 0
        };
      }

      if (revenueColumn) {
        monthlyData[month].revenue += this.parseNumber(row[revenueColumn]);
      }
      if (profitColumn) {
        monthlyData[month].profit += this.parseNumber(row[profitColumn]);
      }
      monthlyData[month].count++;
    });

    // Convert to array and sort
    const trends = Object.entries(monthlyData).map(([month, data]) => ({
      month,
      revenue: data.revenue,
      profit: data.profit,
      orders: data.count
    }));

    return trends;
  },

  /**
   * Parse string to number (handles various formats)
   * @param {any} value - Value to parse
   * @returns {number} Parsed number or 0 if invalid
   */
  parseNumber(value) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;

    // Remove common currency symbols and text
    const cleaned = value
      .replace(/[RM$€£¥]/g, '')
      .replace(/[,\s]/g, '')
      .trim();

    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  },

  /**
   * Format number for display
   * @param {number} num - Number to format
   * @param {string} type - Type of number (revenue, orders, growth, profit)
   * @returns {string} Formatted string
   */
  formatNumber(num, type = 'general') {
    if (type === 'revenue' || type === 'profit') {
      return 'RM' + num.toLocaleString('en-MY', { 
        maximumFractionDigits: 0 
      });
    }
    
    if (type === 'growth') {
      return (num > 0 ? '+' : '') + num.toFixed(1) + '%';
    }

    return num.toLocaleString('en-MY', { maximumFractionDigits: 0 });
  },

  /**
   * Get default metrics (when no data available)
   * @returns {Object} Default metrics
   */
  getDefaultMetrics() {
    return {
      totalRevenue: 0,
      totalProfit: 0,
      totalOrders: 0,
      growthRate: 0,
      topProduct: 'No Data',
      topCategory: 'No Data',
      revenueByCategory: [],
      profitByCategory: [],
      monthlyTrends: [],
      dataFound: false
    };
  }
};
