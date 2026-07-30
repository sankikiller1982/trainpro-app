// ID de la hoja de cálculo compartida entre todos los entrenadores
export const SPREADSHEET_ID = '1l8tBDWLINx_Ui_6fKfm5cZAhIDe7E4I79ZBIjj1X86Y';
export const API_URL = 'https://script.google.com/macros/s/AKfycbwF48CoXa8R55U2SeeTIxh8wXwAJJILtrScVijmWVBsb2M9VhjuvcGxZ2D9T36NInl4Lw/exec';

export type RecordType = 'student' | 'exercise' | 'routine' | 'saved_routine' | 'assignment';

export const sheetsApi = {
  _trainer: '',

  setTrainer(name: string) {
    this._trainer = name;
  },

  async fetchAll() {
    try {
      const url = this._trainer
        ? `${API_URL}?trainer=${encodeURIComponent(this._trainer)}`
        : API_URL;
      const res = await fetch(url);
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
          trainer: this._trainer,
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
          trainer: this._trainer,
        }),
      });
      return await res.json();
    } catch (error) {
      console.error('Error deleting data from Google Sheets:', error);
      return { success: false, error };
    }
  }
};
