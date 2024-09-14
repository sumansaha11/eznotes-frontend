import React, { useState } from 'react'
import ProfileInfo from '../Cards/ProfileInfo.jsx'
import { useNavigate } from 'react-router-dom';
import SearchBar from '../SearchBar/SearchBar.jsx';
import axiosInstance from '../../utils/axiosInstance.js';
import { Cookies } from 'react-cookie';

const Navbar = ({ userInfo, onSearchNote, handleClearSearch }) => {

    const [searchQuery, setSearchQuery] = useState("")
    const navigate = useNavigate();
    const cookie = new Cookies();

    const options = {
        sameSite: 'Strict',
        path: '/',
    };

    const onLogout = async () => {
        try {
            const response = await axiosInstance.post("/users/logout");

            if (response.data && response.data.data) {
                cookie.remove('accessToken', options);
                cookie.remove('refreshToken', options);
                navigate("/login");
            }
        } catch (error) {
            console.log("Error while logging out user!");
        }
    };

    const handleSearch = () => {
        if(searchQuery) {
            onSearchNote(searchQuery);
        }
    };

    const onClearSearch = () => {
        setSearchQuery("");
        handleClearSearch();
    };

    return (
        <div className="bg-blue-300 flex items-center justify-between px-6 py-2 drop-shadow"> <h2 className="text-xl font-medium text-black py-2">ezNotes</h2>

            <SearchBar
                value={searchQuery} onChange={({ target }) => {
                    setSearchQuery(target.value);
                }}
                handleSearch={handleSearch}
                onClearSearch={onClearSearch}
            />

            <ProfileInfo userInfo={userInfo} onLogout={onLogout} />
        </div>
    )
}

export default Navbar;