import React from "react";
import Cookies from "js-cookie";

const CSRFToken = () => {
    return <input type="hidden" name="csrfmiddlewaretoken" value={Cookies.get("csrftoken")}/>;
};

export default CSRFToken;
