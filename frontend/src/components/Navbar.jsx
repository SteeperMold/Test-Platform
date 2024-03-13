import React, {useEffect, useState} from 'react';
import axios from "axios";
import "../static/css/navbar.css";
import {baseURL} from "../App";
import CSRFToken from "./CSRFToken";

const Navbar = () => {
    const [user, setUser] = useState(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    useEffect(() => {
        axios.get(`${baseURL}/api/get_user_data/`)
            .then(response => {
                if (response.data.authenticated)
                    setUser(response.data);
            })
            .catch(error => console.error(error));

        const handleClick = (event) => setDropdownOpen(event.target.closest('.dropdown-button'));
        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    return (
        <nav>
            <div className="navbar-left">
                <a href={`${baseURL}/`}>Главная</a>
            </div>
            <div className="navbar-right">
                <a href={`${baseURL}/tests/`}>Тесты</a>
                {user ? (
                    <div className="account-dropdown">
                        <button className="dropdown-button">{user.username}</button>
                        <div className="dropdown-content" style={{display: `${dropdownOpen ? "block" : "none"}`}}>
                            <a href={`${baseURL}/profile/`}>Профиль</a>
                            <a href={`${baseURL}/settings/`}>Настройки</a>
                            <form className="logout-form" method="post" action={`${baseURL}/accounts/logout/`}>
                                <CSRFToken/>
                                <button className="button-link" type="submit">Выйти</button>
                            </form>
                        </div>
                    </div>
                ) : (
                    <>
                        <a href={`${baseURL}/accounts/signup/`}>Зарегистрироваться</a>
                        <a href={`${baseURL}/accounts/login/`}>Войти в аккаунт</a>
                    </>
                )}
                <a href={`${baseURL}/`} className="learn-more-btn">Узнать больше</a>
            </div>
        </nav>
    );
}

export default Navbar;
