import React from "react";

const ErrorMessage = ({message}) => {
    return (
        <div style={{textAlign: "center"}}>
            <h1>{message}</h1>
            <a href="http://localhost:8000/" className="button1">На главную</a>
        </div>
    );
};

export default ErrorMessage;
