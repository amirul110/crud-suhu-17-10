export const API_URL = process.env.API_URL;

export const API_ENDPOINTS = {
    // Users endpoints
    GETALLUSERS: `${API_URL}/user`,
    GETUSERBYID: (id: string) => `${API_URL}/user/${id}`,
    ADDUSER: `${API_URL}/user/create`, // Adjust according to your backend
    EDITUSER: (id: string) => `${API_URL}/user/edit/${id}`, // Adjust according to your backend
    DELETEUSER: (id: string) => `${API_URL}/user/delete/${id}`, // Adjust according to your backend

    GETALLMESIN: `${API_URL}/master-mesin`,
    GETMESINBYID: (id: number) => `${API_URL}/master-mesin/${id}`,
    ADDMESIN: `${API_URL}/master-mesin/create`,
    EDITMESIN: (id: number) => `${API_URL}/master-mesin/edit/${id}`,
    DELETEMESIN: (id: number) => `${API_URL}/master-mesin/delete/${id}`,

    GETALLMONITORSUHU: `${API_URL}/monitor-suhu`,
    IMPORTEXCEL: `${API_URL}/monitor-suhu/import`,
    GETMONITORSUHUBYID: (id: number) => `${API_URL}/monitor-suhu/${id}`,
    ADDMONITORSUHU: `${API_URL}/monitor-suhu/create`,
    EDITMONITORSUHU: (id: number) => `${API_URL}/monitor-suhu/edit/${id}`,
    DELETEMONITORSUHU: (id: number) => `${API_URL}/monitor-suhu/delete/${id}`
};