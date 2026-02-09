import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '../../../context/AuthContext';

// 定義 User 類型
type User = {
    page?: "menu" | "profile" | "testing" | "score";
    tid?: string;
    lessonImg?: string;
    lessonType?: string;
    UserID?: string;
    UserName?: string;
    currenttimes?: number;
    tests?: createTest
};

// 定義 Context 資料的型別
type UserContextType = {
    userData: User | null;
    setUserData: (user: User) => void;
    //logout: () => void;
};

type Props = { children: React.ReactNode }

// 建立 Context，預設為 undefined（透過 useContext 時檢查）
const DataContext = createContext<UserContextType | undefined>(undefined);

// Provider 組件
export const DataProvider = ({ children }: Props) => {

    const [userData, setUserData] = useState<User | null>(null);
    const { userInfoData } = useAuth();

    React.useEffect(() => {
        if (userInfoData) {
            setUserData((prev) => {
                // If data is already synced, return previous state to avoid re-renders
                if (prev?.UserID === userInfoData.account && prev?.UserName === userInfoData.username) {
                    return prev;
                }
                return {
                    ...(prev || {}),
                    UserID: userInfoData.account,
                    UserName: userInfoData.username
                };
            });
        }
    }, [userInfoData]);

    return (
        <DataContext.Provider value={{ userData, setUserData }}>
            {children}
        </DataContext.Provider>
    );
};

// 自定義 hook，方便使用並加上錯誤檢查
export const useUserData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
