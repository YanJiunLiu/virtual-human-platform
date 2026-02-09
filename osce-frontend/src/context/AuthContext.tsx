import React, { createContext, useState } from "react";
import { userLoginApi, adminLoginApi, userLogoutApi } from "../api";

interface AuthContextType {
    token: string | undefined;
    adminInfoData: { account: string, username: string } | null;
    userInfoData: { account: string, username: string } | null;
    adminLogin: (account: string, password: string) => Promise<boolean>;
    userLogin: (account: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);

//session storage with expire time
type StoredItem = {
    token: string; //token的值
    expire: number; //過期的時間戳
    adminData?: { account: string, username: string };
    userData?: { account: string, username: string };
};

//設置過期時間的session storage(以分鐘為單位)
const setSessionItemWithExpire = (key: string, token: string, min: number, adminData?: { account: string, username: string }, userData?: { account: string, username: string }) => {
    const data: StoredItem = {
        token: token,
        expire: Date.now() + (min * 60 * 1000),
        adminData,
        userData
    };
    sessionStorage.setItem(key, JSON.stringify(data));
}

//取得有過期時間的session storage，若過期則回傳null
const getSessionItemWithExpire = (key: string) => {
    const itemStr = sessionStorage.getItem(key);
    if (!itemStr) return null;

    const item: StoredItem = JSON.parse(itemStr) as StoredItem;
    // console.log(item.token, `${Math.floor((item.expire - Date.now()) / 60000)} mins remaining until expiration`);
    // 過期 → 清除並回傳 null
    if (Date.now() > item.expire) {
        sessionStorage.removeItem(key);
        return null;
    }

    return item;
}


type Props = { children: React.ReactNode }

export const AuthProvider = ({ children }: Props) => {
    const storedItem = getSessionItemWithExpire('osce-token');

    // Initialize state from storage if valid
    const [authToken, setAuthToken] = useState<string | null>(storedItem ? storedItem.token : null);
    const [adminData, setAdminData] = useState<{ account: string, username: string } | null>(storedItem?.adminData || null);
    const [userData, setUserData] = useState<{ account: string, username: string } | null>(storedItem?.userData || null);

    const adminLogin = async (account: string, password: string): Promise<boolean> => {
        if (!account || !password) {
            alert('帳號或密碼欄位不能空白');
            return false;
        }
        try {
            const result = await adminLoginApi({ account, password });
            const res = result as { token: string, account: string, state: string, username: string };

            if (res.state === 'success') {
                const newAdminData = { account: res.account, username: res.username };
                setAuthToken(res.token);
                setAdminData(newAdminData);
                setSessionItemWithExpire(
                    "osce-token",
                    res.token,
                    import.meta.env.VITE_TIMEOUT_MIN ? parseInt(import.meta.env.VITE_TIMEOUT_MIN) : 30,  //預設30分鐘後過期
                    newAdminData,
                    undefined
                );
                return true;
            } else {
                alert('登入失敗');
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('登入過程中發生錯誤');
            return false;
        }
    };

    const userLogin = async (account: string, password: string): Promise<boolean> => {
        if (!account || !password) {
            alert('帳號或密碼欄位不能空白');
            return false;
        }
        try {
            const result = await userLoginApi({ account, password });
            const res = result as { token: string, account: string, state: string, username: string };
            if (res.state === 'success') {
                const newUserData = { account: res.account, username: res.username };
                setAuthToken(res.token);
                setUserData(newUserData);

                setSessionItemWithExpire(
                    "osce-token",
                    res.token,
                    import.meta.env.VITE_TIMEOUT_MIN ? parseInt(import.meta.env.VITE_TIMEOUT_MIN) : 30,  //預設30分鐘後過期
                    undefined,
                    newUserData
                );
                return true;
            } else {
                alert('登入失敗');
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('登入過程中發生錯誤');
            return false;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            if (authToken) {
                await userLogoutApi({ token: authToken });
            }
        } catch (error) {
            console.error("Logout error", error);
        } finally {
            setAuthToken(null);
            setAdminData(null);
            setUserData(null);
            sessionStorage.removeItem('osce-token'); // Clear the session storage
            localStorage.removeItem('token'); // Keep existing cleanup
            alert('登出成功');
        }
    };


    if (authToken) {
        return (
            <AuthContext.Provider value={{ token: authToken, adminInfoData: adminData, userInfoData: userData, adminLogin, userLogin, logout }}>
                {children}
            </AuthContext.Provider>
        )
    } else {
        return (
            <AuthContext.Provider value={{ token: undefined, adminInfoData: null, userInfoData: null, adminLogin, userLogin, logout }}>
                {children}
            </AuthContext.Provider>
        )
    }
}

export const useAuth = () => {
    const context = React.useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};