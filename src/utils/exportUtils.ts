
/**
 * Convert JSON data to CSV and trigger a download
 */
export function exportToCSV(data: Record<string, any>[], filename: string): void {
  if (!data || !data.length) {
    console.error("No data to export");
    return;
  }

  // Extract headers from the first object
  const headers = Object.keys(data[0]);
  
  // Create CSV rows for all data
  const csvRows = [];
  
  // Add header row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header] === null || row[header] === undefined ? '' : row[header];
      // Handle values with commas or quotes
      const escaped = String(value).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(','));
  }
  
  // Combine rows into a single CSV string
  const csvString = csvRows.join('\n');
  
  // Create a blob and download
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  
  // Create URL and download link
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.display = 'none';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Format date as a string for file names
 */
export function formatDateForFilename(date: Date): string {
  return date.toISOString().split('T')[0]; // YYYY-MM-DD format
}
