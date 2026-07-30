export const API_URL = 'https://script.google.com/macros/s/AKfycbwF48CoXa8R55U2SeeTIxh8wXwAJJILtrScVijmWVBsb2M9VhjuvcGxZ2D9T36NInl4Lw/exec';

export type RecordType = 'student' | 'exercise' | 'routine' | 'saved_routine' | 'assignment';

export const sheetsApi = {
  async fetchAll() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error('Network response was not ok');
      return await res.json();
    } catch (error) {
      console.error('Error fetching data from Google Sheets:', error);
      return [];
    }
  },

  async saveRecord(id: string, type: RecordType, payload: any) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', 
        },
        body: JSON.stringify({
          action: 'save',
          id,
          type,
          data: payload,
        }),
      });
      return await res.json();
    } catch (error) {
      console.error('Error saving data to Google Sheets:', error);
      return { success: false, error };
    }
  },

  async deleteRecord(id: string, type: RecordType) {
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8', 
        },
        body: JSON.stringify({
          action: 'delete',
          id,
          type,
        }),
      });
      return await res.json();
    } catch (error) {
      console.error('Error deleting data from Google Sheets:', error);
      return { success: false, error };
    }
  }
};
