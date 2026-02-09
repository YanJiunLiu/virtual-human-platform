import Login from "./login"
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from "./main";
import AppBar from "../user/appbar";
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from '../../context/AuthContext';

import { WebRTCProvider } from "./context/WebRTCContext";

//import { useState } from 'react'
export default () => {
    return (
        <AuthProvider>
            <DataProvider>
                <WebRTCProvider>
                    <Router basename="/user">
                        <Routes >
                            <Route index path="login" element={
                                <Login type="user" logining={(user: string, password: string) => {
                                    console.log(user, password)
                                }}
                                />
                            } />
                            <Route path="/" element={<AppBar />}>
                                <Route path="/main" element={<Main />} />
                                {/**
                                 * 
                                <Route path="/profile" element={<Profile />} />
                                <Route path="/testing" element={<Testing />} />
                                <Route path="/score" element={<Score />} />
                                */}

                            </Route>
                        </Routes>
                    </Router>
                </WebRTCProvider>
            </DataProvider>
        </AuthProvider>

    )
}

