import React, {createContext} from 'react';


interface CreateTestContextType {
    payload: createTest | {},
    replacePayload: (payload:createTest) => void
}

const CreateTestContext = createContext<CreateTestContextType | undefined>(undefined);

type Props = { children: React.ReactNode }
export const CreateTestProvider = ({children}:Props)=>{
    const [payload, setPayload] = React.useState<createTest | {}>({});
    const replacePayload = (payload:createTest) => {
        setPayload(payload);
        return
    }   
    return (
        <CreateTestContext.Provider value={{payload, replacePayload}}>
            {children}
        </CreateTestContext.Provider>
    )
}

export const useCreateTest = () => {
    const context = React.useContext(CreateTestContext);
    if (context === undefined) {
        throw new Error('useCreateTest must be used within a CreateTestProvider');
    }
    return context;
};