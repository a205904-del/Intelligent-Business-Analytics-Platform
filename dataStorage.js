/**
 * Data Storage Module
 * Handles temporary storage of parsed Excel data in localStorage
 * Provides methods to save, retrieve, and clear business data
 */

const DataStorage = {
  // Key for storing data in localStorage
  STORAGE_KEY: 'intelligibiz_business_data',

  /**
   * Save parsed data to localStorage
   * @param {Object} data - The parsed business data
   * @param {Array} data.rows - Array of data rows
   * @param {string} data.fileName - Name of uploaded file
   * @param {Date} data.uploadTime - When the data was uploaded
   * @param {Object} data.metrics - Calculated metrics
   */
  saveData(data) {
    try {
      const storageData = {
        rows: data.rows,
        fileName: data.fileName,
        uploadTime: new Date().toISOString(),
        columnHeaders: data.columnHeaders || [],
        metrics: data.metrics || {}
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storageData));
      console.log('Data saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  },

  /**
   * Retrieve stored business data from localStorage
   * @returns {Object|null} The stored data or null if not found
   */
  getData() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error retrieving data:', error);
      return null;
    }
  },

  /**
   * Clear all stored business data
   */
  clearData() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('Data cleared successfully');
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  },

  /**
   * Check if data exists in storage
   * @returns {boolean} True if data exists
   */
  hasData() {
    return localStorage.getItem(this.STORAGE_KEY) !== null;
  }
};
