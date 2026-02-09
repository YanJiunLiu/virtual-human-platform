type UserList = {
    counts: number,
    results: User[]
}

type User = {
    id?: string
    account: string
    last_name?: string
    first_name?: string
    password? :string
    alias_name?: string
    serial: string
    school_department?: {
        name: string
    }
    email?: string
    group_count?: number
    case_count?: number
    role?:{
        name:string
    }
    is_superuser:boolean
    is_active:boolean
};