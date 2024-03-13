import React, {useEffect, useState} from "react";
import "../static/css/no_zoom_popup.css";
import "../static/css/presets.css";
import cross_svg from "../static/svg/cross.svg";

const NoZoomPopup = () => {
    const [popupOpen, setPopupOpen] = useState(false);
    const [popupShown, setPopupShown] = useState(false); // Чтобы показать попап только один раз

    useEffect(() => {
        window.addEventListener('resize', () => setPopupOpen(true));
    });

    const closePopup = () => {
        setPopupOpen(false);
        setPopupShown(true);
    };

    return (
        <>
            {popupOpen && !popupShown && (
                <div className="popup-background">
                    <div className="popup">
                        <header className="header">
                            <p className="warning">Предупреждение</p>
                            <img onClick={closePopup} src={cross_svg} alt="Закрыть"/>
                        </header>
                        <p className="message">
                            Мы обнаружили, что вы используете масштабирование. Из-за этого, редактор работает
                            некорректно. Пожалуйста, верните масштаб на 100%.
                        </p>
                    </div>
                </div>
            )}
        </>
    )
};

export default NoZoomPopup;
