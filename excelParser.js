/**
 * Excel Data Parser Module
 * Handles parsing of Excel (.xlsx, .xls) and CSV files
 * Extracts and validates business data
 */

const ExcelParser = {
  /**
   * Parse Excel or CSV file
   * @param {File} file - The uploaded file
   * @returns {Promise<Object>} Parsed data with rows and headers
   */
  async parseFile(file) {
    try {
      // Validate file type
      if (!this.isValidFileType(file)) {
        throw new Error('Invalid file type. Please upload .xlsx, .xls, or .csv file.');
      }

      // Handle CSV files
      if (file.name.endsWith('.csv')) {
        return await this.parseCSV(file);
      }

      // Handle Excel files
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        return await this.parseExcel(file);
      }

      throw new Error('Unsupported file format');
    } catch (error) {
      console.error('Parser error:', error);
      throw error;
    }
  },

  /**
   * Check if file type is supported
   * @param {File} file - The file to check
   * @returns {boolean} True if file type is supported
   */
  isValidFileType(file) {
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv'
    ];
    
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    return validTypes.includes(file.type) || validExtensions.includes(fileExtension);
  },

  /**
   * Parse CSV file
   * @param {File} file - CSV file to parse
   * @returns {Promise<Object>} Parsed data
   */
  parseCSV(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const csv = e.target.result;
          const lines = csv.split('\n').filter(line => line.trim());
          
          if (lines.length === 0) {
            throw new Error('CSV file is empty');
          }

          // First line is headers
          const headers = this.parseCSVLine(lines[0]);
          
          // Rest are data rows
          const rows = lines.slice(1).map(line => {
            const values = this.parseCSVLine(line);
            const row = {};
            headers.forEach((header, index) => {
              row[header] = values[index] || '';
            });
            return row;
          });

          resolve({
            rows,
            columnHeaders: headers,
            fileName: file.name
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read CSV file'));
      reader.readAsText(file);
    });
  },

  /**
   * Parse a single CSV line (handles quoted values)
   * @param {string} line - CSV line to parse
   * @returns {Array} Array of values
   */
  parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }

    result.push(current.trim());
    return result;
  },

  /**
   * Parse Excel file using XLSX library
   * @param {File} file - Excel file to parse
   * @returns {Promise<Object>} Parsed data
   */
  parseExcel(file) {
    return new Promise((resolve, reject) => {
      // Check if XLSX library is loaded
      if (typeof XLSX === 'undefined') {
        reject(new Error('XLSX library not loaded. Please reload the page.'));
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = e.target.result;
          const workbook = XLSX.read(data, { type: 'array' });
          
          if (workbook.SheetNames.length === 0) {
            throw new Error('Excel file has no sheets');
          }

          // Parse first sheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert sheet to JSON
          const rows = XLSX.utils.sheet_to_json(worksheet);
          
          if (rows.length === 0) {
            throw new Error('Excel sheet is empty');
          }

          // Get column headers
          const columnHeaders = Object.keys(rows[0]);

          resolve({
            rows,
            columnHeaders,
            fileName: file.name
          });
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsArrayBuffer(file);
    });
  }
};
