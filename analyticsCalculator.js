/**
 * Business Analytics Calculator Module
 * Calculates key metrics from parsed business data
 * Supports flexible column name detection (revenue, orders, products)
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

    // Calculate metrics
    const totalRevenue = this.calculateTotalRevenue(rows, revenueColumn);
    const totalOrders = this.calculateTotalOrders(rows, ordersColumn);
    const growthRate = this.calculateGrowthRate(rows, revenueColumn);
    const topProduct = this.findTopProduct(rows, productColumn, revenueColumn);

    return {
      totalRevenue,
      totalOrders,
      growthRate,
      topProduct,
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
   * @param {string} type - Type of number (revenue, orders, growth)
   * @returns {string} Formatted string
   */
  formatNumber(num, type = 'general') {
    if (type === 'revenue') {
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
      totalOrders: 0,
      growthRate: 0,
      topProduct: 'No Data',
      dataFound: false
    };
  }
};
