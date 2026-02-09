import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DataProvider } from "./context/DataContext";
import { AuthProvider } from '../../context/AuthContext';
import { CreateTestProvider } from './context/CreateTestContext';
import Tests from "./tests"
import Login from "./login"
import AppBar from "./AppBar";
import Users from './users';
import Group from './group';
import Department from './department';
import Disease from './disease';
import Histroy from './histroy';
import Create from './create';
import MenuContent from './menuContent';

export default () => {
    return (
        <DataProvider>
            <AuthProvider>
                <CreateTestProvider>
                    <Router basename="/admin">
                        <Routes >
                            <Route index path="login" element={<Login />} />
                            <Route path="/" element={<AppBar />}>
                                <Route element={<MenuContent />}>
                                    <Route path="/tests" index element={<Tests />} />
                                    <Route path="/users" index element={<Users />} />
                                    <Route path="/group" index element={<Group />} />
                                    <Route path="/department" index element={<Department />} />
                                    <Route path="/disease" index element={<Disease />} />
                                    <Route path="/histroy" index element={<Histroy />} />
                                </Route>
                                <Route path="/create" index element={<Create />} />
                            </Route>
                        </Routes>
                    </Router>
                </CreateTestProvider>
            </AuthProvider>
        </DataProvider>
    )
}

