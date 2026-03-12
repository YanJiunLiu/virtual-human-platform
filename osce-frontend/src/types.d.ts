
type PatientProp = {
    dept: string,
    patients: {
        tid: number,
        name: string,
        img: string,
        description: string,
        complete: number
    }[]
}

type BtnProps = {
    color: string;
    click: () => void;
    text: string
    icon: IconDefinition
};
interface DepartmentList {
    counts: number,
    results: Department[]
}
interface Department {
    id: string,
    department_name?: string | undefined,
    medical_history?: { category: string }[]
    created_by?: string | undefined
    tests?: createTest[]
}

interface History {
    category: string
}

interface standardizedpatientList {
    counts: number,
    results: standardizedpatient[]
}

interface standardizedpatient {
    id?: string,
    head_shot?: string,
    lesson_plan?: any[],
    last_name?: string,
    age?: string | number
    gender?: string,
    title?: string,
    job_title?: string,
    language?: string,
    tone?: string,
    hair_color?: string,
    hair_styles?: string,
    complexion?: string,
    voiceprint?: string,
    clothing_style?: string,
    other?: string
}


interface createTest {
    id?: string,
    department?: Department,
    topic?: string,
    station?: { name?: string },
    item?: string,
    criteria?: { description?: string }[],
    timer_number?: string
    timer_unit?: string,
    guideline_content?: string,
    standardized_patient?: standardizedpatient,
    medical_history_settings?: { ai_button?: boolean, category?: string, description?: string, sentence?: string }[],
    main_description?: { ai_button?: boolean, category?: string, description?: string, sentence?: string }
    patient?: { ai_button?: boolean, name?: string },
    tester?: { ai_button?: boolean },
    check_data?: CheckData[],
    DJ_mode?: boolean,
    diagnosis_treatment_plan?: boolean,
    diagnosis?: string,
    treatment?: string,
    // ---- USER端附加條件
    complete?: boolean,
    currenttimes?: number,
}

type Rect = {
    index: string;
    x: number;
    y: number;
    width: number;
    height: number;
    text:string
};

type CheckData = {
    img?: string,
    title?: string,
    rects?: Rect[]
}

type TestResult = {
    check_data: CheckData[]
}
