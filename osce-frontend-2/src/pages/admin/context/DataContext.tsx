// UserContext.tsx
import React, { createContext, useContext, useState } from 'react';

 // 定義 Context 資料的型別
type UserContextType = {
    topLeftBtns: React.ReactNode | null
    setTopLeftBtns: React.Dispatch<React.SetStateAction<React.ReactNode | null>>
};

type Props = { children: React.ReactNode }

// 建立 Context，預設為 undefined（透過 useContext 時檢查）
const DataContext = createContext< UserContextType | undefined>(undefined);

// Provider 組件
export const DataProvider = ({ children }: Props) => {
    const [topLeftBtns , setTopLeftBtns ] = useState< React.ReactNode | null>(null);
    return (
        <DataContext.Provider value={{ topLeftBtns, setTopLeftBtns }}>
            {children}
        </DataContext.Provider>
    );
};

// 自定義 hook，方便使用並加上錯誤檢查
export const usePageData = () => {
    const context = useContext(DataContext);
    if (!context) {
        throw new Error('useAdminData must be used within a DataProvider');
    }
    return context;
};
