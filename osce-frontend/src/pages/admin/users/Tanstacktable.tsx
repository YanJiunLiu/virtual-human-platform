
import { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import type { ColumnDef, SortingState } from "@tanstack/react-table";
import {
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table";

// const defaultData: User[] = [
//     { account: "A123456789", lastName: "陳", firstName: "阿達", nickName: "阿達達", serial: "D2023002", dept: "牙醫學系", groups: 3, lessens: 5, email: "test1@gmail.com" },
//     { account: "B123456789", lastName: "林", firstName: "小美", nickName: "美美", serial: "D2023003", dept: "醫學系", groups: 2, lessens: 4, email: "test2@gmail.com" },
//     { account: "C123456789", lastName: "黃", firstName: "大華", nickName: "華華", serial: "D2023004", dept: "護理系", groups: 1, lessens: 2, email: "test3@gmail.com" },
//     { account: "D123456789", lastName: "張", firstName: "小強", nickName: "強強", serial: "D2023005", dept: "藥學系", groups: 4, lessens: 6, email: "test4@gmail.com" },
//     { account: "E123456789", lastName: "劉", firstName: "美玲", nickName: "玲玲", serial: "D2023006", dept: "公共衛生系", groups: 2, lessens: 3, email: "test5@gmail.com" },
//     { account: "F123456789", lastName: "王", firstName: "志明", nickName: "明明", serial: "D2023007", dept: "醫學系", groups: 3, lessens: 5, email: "test6@gmail.com" },
//     { account: "G123456789", lastName: "蔡", firstName: "玉珍", nickName: "珍珍", serial: "D2023008", dept: "牙醫學系", groups: 1, lessens: 2, email: "test7@gmail.com" },
//     { account: "H123456789", lastName: "鄭", firstName: "建國", nickName: "國國", serial: "D2023009", dept: "護理系", groups: 4, lessens: 7, email: "test8@gmail.com" },
//     { account: "I123456789", lastName: "謝", firstName: "秀英", nickName: "英英", serial: "D2023010", dept: "藥學系", groups: 2, lessens: 4, email: "test9@gmail.com" },
//     { account: "J123456789", lastName: "何", firstName: "志玲", nickName: "啊玲", serial: "D2023011", dept: "公共衛生系", groups: 3, lessens: 6, email: "test10@gmail.com" },
// ];

const columns: ColumnDef<User>[] = [
    {
        accessorKey: "account",
        header: "帳號",
        enableSorting: true,
    }, {
        accessorKey: "first_name",
        header: "名",
        enableSorting: true,
    }, {
        accessorKey: "last_name",
        header: "姓",
        enableSorting: true,
    }, {
        accessorKey: "alias_name",
        header: "別名",
        enableSorting: true,
    }, {
        accessorKey: "serial",
        header: "編號",
        enableSorting: true,
    }, {
        accessorKey: "school_department.name",
        header: "學系部門",
        enableSorting: true,
    }, {
        accessorKey: "group_count",
        header: "群組數",
        enableSorting: true,
    }, {
        accessorKey: "case_count",
        header: "課程數",
        enableSorting: true,
    }
];


type TableProps = {
    //tdata: any
    //doClear:()=>void;
    defaultData: User[];
    sendUserData: (user: User) => void
};

const rowOn: string = " bg-osce-blue-5 text-white focus:bg-osce-gray-4 text-white hover:bg-osce-blue-4 ";
const rowOff: string = "hover:bg-gray-50 text-gray-800";


// 定義子元件可暴露給父元件呼叫的介面
export type TableRef = {
    resetForm: () => void;
};




export default forwardRef<TableRef, TableProps>(({ defaultData, sendUserData }, ref) => {
    const [data, setData] = useState<User[]>(defaultData);
    const [sorting, setSorting] = useState<SortingState>([]);
    const [currentRow, setCurrentRow] = useState<string>("");
    const table = useReactTable({
        data,
        columns,
        state: { sorting },
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    });

    // 這裡是內部的函式
    const resetForm = () => {
        setCurrentRow("")//清除已選取的資料
    };

    // ✅ 將 resetForm 暴露給父元件
    useImperativeHandle(ref, () => ({
        resetForm,
    }));
    useEffect(() => {
        setData(defaultData)
    }, [defaultData])
    return (
        <table className="divide-y divide-gray-200 text-sm w-full min-w-[800px]">
            <thead className="bg-gray-100">
                {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id}>
                        <th>活躍</th>
                        {headerGroup.headers.map((header) => {
                            const canSort = header.column.getCanSort();
                            const sortDir = header.column.getIsSorted();

                            return (
                                <th
                                    key={header.id}
                                    onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                                    className={`px-4 py-3 text-left font-semibold text-gray-700 ${canSort ? "cursor-pointer select-none hover:bg-gray-200" : ""
                                        }`}
                                >
                                    <div className="flex items-center gap-1">
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                        {canSort && (
                                            <span className="text-gray-500">
                                                {sortDir === "asc" ? "▲" : sortDir === "desc" ? "▼" : "⇅"}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            );
                        })}
                    </tr>
                ))}
            </thead>

            <tbody className="divide-y divide-gray-100 bg-white">
                {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className={row.id == currentRow ? rowOn : rowOff} onClick={() => {
                        setCurrentRow(row.id)
                        sendUserData(row.original)
                    }}>
                        <td>
                            <input type="checkbox" className="m-2" />
                        </td>
                        {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-4 py-2 ">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </table>
    );
})
