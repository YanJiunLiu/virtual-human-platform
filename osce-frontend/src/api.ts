// type &&　interface
interface LoginData {
    account: string,
    password: string
}
interface DefaultRequestInit extends RequestInit {
    method?: string;
    credentials?: RequestCredentials;
    mode?: RequestMode;
    body?: string | undefined;
    headers: {
        'Content-Type'?: string;
        'Authorization'?: string | undefined;
    };
}
interface requestData {
    id?: string | undefined;
    token?: string | undefined;
    data?: any;
}
// api.ts
const API_BASE = import.meta.env.DEV ?
    import.meta.env.VITE_API_BASE_DEV :
    import.meta.env.VITE_API_BASE_PROD;

const defaultOptions: DefaultRequestInit = {
    method: "POST",
    credentials: 'include',
    mode: 'cors',
    headers: {
        'Content-Type': 'application/json',
    },
}
// API：使用者登入
export async function userLoginApi(data: LoginData) {
    defaultOptions.method = "POST"
    defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': undefined
    }
    defaultOptions.body = JSON.stringify(data)
    return await fetchWithTimeout(`${API_BASE}/mgmt/user/user_login/`, {
        ...defaultOptions,
    })
}

export async function userProfile() {
    return await fetchWithTimeout(`${API_BASE}/userProfile`, {
        ...defaultOptions,
        method: "GET",
    })
}

export async function userLogoutApi(requestData: requestData) {
    defaultOptions.method = "POST"
    defaultOptions.headers = {
        'Content-Type': 'application/json',
        'Authorization': requestData.token
    }
    defaultOptions.body = undefined
    return await fetchWithTimeout(`${API_BASE}/mgmt/user/logout/`, {
        ...defaultOptions,
    })
}

export async function userGetCase(requestData: requestData) {
    defaultOptions.method = "GET"
    defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': requestData.token
    }
    defaultOptions.body = undefined
    return await fetchWithTimeout(`${API_BASE}/osce/case/${requestData.id}/`, {
        ...defaultOptions,
    })
}

export async function userGetPatientProfile(data: { tid: number }) {
    return await fetchWithTimeout(`${API_BASE}/userGetPatientProfile`, {
        ...defaultOptions,
        body: JSON.stringify(data)
    })
}

export async function userTestResult(
    act: "get" | "list" | "create" | "update" | "delete",
    requestData: requestData
) {
    defaultOptions.method = (
        act == "create" ? "POST" :
            act == "update" ? "PATCH" :
                act == "delete" ? "DELETE" :
                    "GET"
    )
    defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': requestData.token
    };

    (act == "create" || act == "update") ?
        defaultOptions.body = JSON.stringify(requestData.data) :
        defaultOptions.body = undefined

    const url = `${API_BASE}/osce/testresults/${(act == "get" || act == "update" || act == "delete") ? (requestData.id + "/") : ""
        }`
    return await fetchWithTimeout(url, {
        ...defaultOptions
    })
}

export async function userCreateIdleVideo(requestData: requestData) {
    defaultOptions.method = "POST"
    defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': requestData.token
    }
    defaultOptions.body = JSON.stringify(requestData.data)
    return await fetchWithTimeout(`${API_BASE}/talker/chat/idle_video/`, {
        ...defaultOptions,
    })
}

export async function userSTT(requestData: requestData) {
    return await fetchWithTimeout(`${API_BASE}/talker/chat/stt/`, {
        method: "POST",
        headers: { 'Authorization': requestData.token },
        body: requestData.data
    })
}

export async function userChatWithOllama(requestData: requestData) {
    defaultOptions.method = "POST"
    defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': requestData.token
    }
    defaultOptions.body = JSON.stringify(requestData.data)
    return await fetchWithTimeout(`${API_BASE}/talker/chat/ollama/`, {
        ...defaultOptions
    })
}
// export async function userGetMessages(data: { tid: number, times: number }) {
//     return await fetchWithTimeout(`${API_BASE}/userGetMessages`, {
//         ...defaultOptions,
//         body: JSON.stringify(data)
//     })
// }

export async function uploadAudio(blob: Blob) {

    //const _dev = import.meta.env.DEV
    return await new Promise((resolve) => {
        /*if (_dev) {
            const url = import.meta.env.VITE_SOUND_API_BASE_DEV

            const formData = new FormData();
            formData.append('Account', 'test');
            formData.append('AudioFile', blob, 'audio.webm'); // ✅ 檔案名稱也要提供
            fetch(url, {
                method: 'POST',
                body: formData,
                mode: 'cors',
            })
                .then(response => { console.log(response); response.json() })
                .then(data => { console.log(data); resolve(data) })
                .catch(error => console.error('Error:', error));

        } else {
         */
        //丟到後端再處理

        const formData = new FormData();
        formData.append('audio', blob, 'recording.webm');
        console.log(`${API_BASE}/userConversation`)
        fetch(`${API_BASE}/userConversation`, {
            method: 'POST',
            body: formData
        })
            .then(res => res.text())
            .then(data => {
                console.log('上傳成功:', data);
                resolve(data)
            })
            .catch(err => {
                console.error('上傳失敗:', err);
            });
        // }
    })
}
/*
export async function uploadAudio(blob: Blob) {
    const url = import.meta.env.DEV ?
        import.meta.env.VITE_SOUND_API_BASE_DEV :
        import.meta.env.VITE_SOUND_API_BASE_PROD;

    return await new Promise((resolve) => {
        const formData = new FormData();
        formData.append('Account', 'test');
        formData.append('AudioFile', blob, 'audio.webm'); // ✅ 檔案名稱也要提供
        fetch(url, {
            method: 'POST',
            body: formData,
            mode: 'cors',
        })
        .then(response => { console.log(response); response.json() })
        .then(data => { console.log("回應資料：",data); resolve(data) })
        .catch(error => console.error('Error:', error));
    })
}
*/

export async function uploadMessages(data: { tid: number, doctor: string, patient: string, token: string, currenttimes: number }) {
    return await fetchWithTimeout(`${API_BASE}/userUploadMessages`, {
        ...defaultOptions,
        body: JSON.stringify(data)
    })

}

//admin
export async function adminLoginApi(data: LoginData) {
    defaultOptions.method = "POST"
    defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': undefined
    }
    defaultOptions.body = JSON.stringify(data)
    return await fetchWithTimeout(`${API_BASE}/mgmt/user/admin_login/`, {
        ...defaultOptions
    })
}

//user
export async function adminUserManagement(
    act: "get" | "list" | "create" | "update" | "delete",
    requestData: requestData
) {
    defaultOptions.method = (
        act == "create" ? "POST" :
            act == "update" ? "PATCH" :
                act == "delete" ? "DELETE" :
                    "GET"
    )
    defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': requestData.token
    };

    (act == "create" || act == "update") ?
        defaultOptions.body = JSON.stringify(requestData.data) :
        defaultOptions.body = undefined

    const url = `${API_BASE}/mgmt/user/${(act == "get" || act == "update" || act == "delete") ? (requestData.id + "/") : ""
        }`
    console.log(requestData)
    console.log(url)
    console.log(defaultOptions.body)
    return await fetchWithTimeout(url, {
        ...defaultOptions
    })
}

export async function adminListDepartments(requestData: requestData) {
    defaultOptions.method = "GET"
    defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': requestData.token
    }
    defaultOptions.body = undefined
    return await fetchWithTimeout(`${API_BASE}/osce/departments/`, {
        ...defaultOptions,
    })
}

export async function adminCreateDepartments(requestData: requestData) {
    defaultOptions.method = "POST"
    defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': requestData.token
    }
    defaultOptions.body = JSON.stringify(requestData.data)
    return await fetchWithTimeout(`${API_BASE}/osce/departments/`, {
        ...defaultOptions,
    })
}

export async function adminUpdateDepartments(requestData: requestData) {
    defaultOptions.method = "PATCH"
    defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': requestData.token
    }
    defaultOptions.body = JSON.stringify(requestData.data)
    return await fetchWithTimeout(`${API_BASE}/osce/departments/${requestData.id}/`, {
        ...defaultOptions,
    })
}

export async function adminDeleteDepartments(requestData: requestData) {
    defaultOptions.method = "DELETE"
    defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': requestData.token
    }
    defaultOptions.body = undefined
    return await fetchWithTimeout(`${API_BASE}/osce/departments/${requestData.id}/`, {
        ...defaultOptions,
    })
}

export async function adminGetMedicalHistory(requestData: requestData) {
    defaultOptions.method = "GET"
    defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': requestData.token
    }
    defaultOptions.body = undefined
    return await fetchWithTimeout(`${API_BASE}/osce/departments/${requestData.id}/medicalhistory/`, {
        ...defaultOptions,
    })
}

//Standardpatients
export async function adminStandardpatients(
    act: "get" | "list" | "create" | "update" | "delete",
    requestData: requestData
) {
    defaultOptions.method = (
        act == "create" ? "POST" :
            act == "update" ? "PATCH" :
                act == "delete" ? "DELETE" :
                    "GET"
    )
    defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': requestData.token
    };
    (act == "create" || act == "update") ?
        defaultOptions.body = JSON.stringify(requestData.data) :
        defaultOptions.body = undefined

    const url = `${API_BASE}/osce/standardizedpatients/${(act == "get" || act == "update" || act == "delete") ? (requestData.id + "/") : ""
        }`
    console.log(url, defaultOptions)
    return await fetchWithTimeout(url, {
        ...defaultOptions
    })
}

//Standardpatients end
export async function adminListDepartmentTests(requestData: requestData) {
    defaultOptions.method = "GET"
    defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': requestData.token
    }
    defaultOptions.body = undefined
    return await fetchWithTimeout(`${API_BASE}/osce/departments/list_test/`, {
        ...defaultOptions
    })
}
//教案相關
/*
export async function adminCreateTests(requestData: requestData) {
    defaultOptions.method = "POST"
    defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': requestData.token
    }
    defaultOptions.body = JSON.stringify(requestData.data)
    return await fetchWithTimeout(`${API_BASE}/osce/case/`, {
        ...defaultOptions
    })
}*/

export async function adminCreateTests(
    act: "get" | "list" | "create" | "update" | "delete",
    requestData: requestData
) {

    defaultOptions.method = (
        act == "create" ? "POST" :
            act == "update" ? "PATCH" :
                act == "delete" ? "DELETE" :
                    "GET"
    )
    defaultOptions.headers = {
        ...defaultOptions.headers,
        'Authorization': requestData.token
    };

    defaultOptions.body = JSON.stringify(requestData.data)
    const url = `${API_BASE}/osce/case/${(act == "get" || act == "update" || act == "delete") ? (requestData.id + "/") : ""}`

    return await fetchWithTimeout(url, {
        ...defaultOptions,
        mode: 'cors',
    })
}


//base
const fetchWithTimeout = async (url: string, options: DefaultRequestInit = { ...defaultOptions }, timeout = 30 * 10000) => {
    const controller = new AbortController();  // 建立控制器
    const timeoutId = setTimeout(() => controller.abort(), timeout); // 設定逾時中止
    return await new Promise((resolve, reject) => {
        fetch(url, {
            ...options,
            signal: controller.signal  // 將 signal 綁定給 fetch
        }).then(response => {
            // console.log(response)
            if (response.status === 204) {
                return { message: "No Content" }
            }
            if (!response.ok) {
                //throw new Error('伺服器錯誤');
                reject(new Error('伺服器錯誤'));
            }
            return response.json();
        }).then(data => {
            resolve(data);
        }).catch(error => {
            if (error.name === 'AbortError') {
                //console.warn('Fetch 請求超時或被中止');
                reject(new Error('請求超時或被中止'));

            } else {
                console.error('請求錯誤：', error.message);
                reject(error);
            }
        }).finally(() => clearTimeout(timeoutId)); // 清理 timeout
    })
}

