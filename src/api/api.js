import axios from 'axios';

const API_URL = 'http://localhost:8000/api/';

    export const login = (username, password) =>
    axios.post(`${API_URL}token/`, { username, password });

    

// Add more API calls as needed