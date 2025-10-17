export const API_URL = process.env.API_URL || 'http://localhost:8100/api';

export const API_ENDPOINTS = {
    // ==================== USERS ENDPOINTS ====================
     GETALLUSERS: `${API_URL}/user`,
    ADDUSER: `${API_URL}/user/create`,
    EDITUSER: (id: string) => `${API_URL}/user/edit/${id}`,
    DELETEUSER: (id: string) => `${API_URL}/user/delete/${id}`,

    // ==================== MESIN ENDPOINTS ====================
    GETALLMESIN: `${API_URL}/master-mesin`,
    GETMESINBYID: (id: number) => `${API_URL}/master-mesin/${id}`,
    ADDMESIN: `${API_URL}/master-mesin/create`,
    EDITMESIN: (id: number) => `${API_URL}/master-mesin/edit/${id}`,
    DELETEMESIN: (id: number) => `${API_URL}/master-mesin/delete/${id}`,

    // ==================== MONITOR SUHU ENDPOINTS ====================
    GETALLMONITORSUHU: `${API_URL}/monitor-suhu`,
    IMPORTEXCEL: `${API_URL}/monitor-suhu/import`,
    GETMONITORSUHUBYID: (id: number) => `${API_URL}/monitor-suhu/${id}`,
    ADDMONITORSUHU: `${API_URL}/monitor-suhu/create`,
    EDITMONITORSUHU: (id: number) => `${API_URL}/monitor-suhu/edit/${id}`,
    DELETEMONITORSUHU: (id: number) => `${API_URL}/monitor-suhu/delete/${id}`
};