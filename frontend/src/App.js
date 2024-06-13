import React from 'react';
import {Route, Routes} from "react-router-dom";
import Navbar from "./components/Navbar";
import TestConstructor from "./pages/test_constructor";
import EditTest from "./pages/edit_test";
import Test from "./pages/test";

const App = () => {
    return (
        <>
            <Navbar/>
            <Routes>
                <Route path="/create-test" element={<TestConstructor/>}/>
                <Route path="/test/:testId/edit" element={<EditTest/>}/>
                <Route path="/test/:testId" element={<Test/>}/>
            </Routes>
        </>
    );
}

export default App;
export const baseURL = "http://localhost:8000"; // "http://45.11.26.52";
