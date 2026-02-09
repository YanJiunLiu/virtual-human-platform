import express from 'express';
import cors from 'cors';
import session from 'express-session';
import { Client } from 'pg';

import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
import FormData from 'form-data';
import https from 'https';
import { exec } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 12000;

//#region server設定 =============================================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 允許來自 port 12001 的請求
app.use(cors({
    origin: 'http://localhost:12001', // 或改成你實際的前端 IP/domain
    credentials: true                  // ⚠️ 必須為 true，允許帶 cookie
}));

// 設定 session middleware
app.use(session({
    secret: 'mySecretKey',             // 用來加密 session ID 的字串
    resave: false,                     // 不會在每次請求時強制儲存 session
    saveUninitialized: false,         // 若尚未初始化就不儲存 session
    cors: true,                // 允許跨域請求
    cookie: {
        maxAge: 600000 * 3,  // Cookie 的有效時間 (毫秒) — 10分鐘:600000
        secure: false,           // ⚠️ 在 HTTPS 時應該為 true
        httpOnly: true,
        //sameSite: 'lax'          // ⚠️ 若你是跨域請改為 'none'
    }

}));
//#endregion server設定 ===========================================================

//#region PostgreSQL =================================================================
//local
/*const config = {
    host: 'localhost',
    port: 5432,
    user: 'chenweida',
    password: 'WADEchen0129',
    database: 'postgres',
};*/
//server
const config = {
    host: '59.124.8.5',
    port: 15432,
    user: 'chenweida',
    password: 'WADEchen0129',
    database: 'database_osce',
};

// 可重複呼叫的 query 函式
async function query(sql, params = []) {
    const client = new Client(config);
    try {
        await client.connect();
        const result = await client.query(sql, params);
        return result.rows;
    } catch (err) {
        console.error('❌ PostgreSQL Query Error:', err);
        throw err;
    } finally {
        await client.end();
    }
}


//#endregion PostgreSQL ==============================================================

//#region 預設路由 =================================================================
// 🔁 預設重導向
app.get('/user', (req, res) => res.redirect('/user/login'));
app.get('/admin', (req, res) => res.redirect('/admin/login'));

// 🔧 提供靜態資源
app.use('/user', express.static(path.join(__dirname, 'dist/user')));
app.use('/admin', express.static(path.join(__dirname, 'dist/admin')));

// 🌐 React Router fallback
app.use('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/user/index.html'));
});
app.use('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/admin/index.html'));
});
//#endregion 預設路由 ==============================================================

//#region API route example =======================================================

//user
app.post('/api/userLogin', async (req, res) => {
    try {
        // const data = req.body;  // req.body 會是 JSON 物件
        const { account, password } = req.body;
        const users = await query(`SELECT * FROM UserAccount where account='${account}'`);
        let _data = { state: "error", account: account };
        if (users.length > 0) {
            const user = users[0]
            if (user.account === account) {
                if (user.password === password) {
                    req.session.user = account; // 儲存使用者帳號到 session
                    _data.state = "success";
                    _data.message = '登入成功';
                } else {
                    _data.state = "wrong password";
                    _data.message = '密碼錯誤';
                }
            }
        }
        res.json(_data);
    } catch (err) {
        console.error('Error fetching users:', err);
    }
});

app.get('/api/userLogout', (req, res) => {
    req.session.destroy();
    res.json({ state: "logout", message: '已登出' });
});

app.get('/api/userProfile', async (req, res) => {
    try {
        // const data = req.body;  // req.body 會是 JSON 物件
        const user = await query(`
            SELECT * FROM UserAccount where account='${req.session.user}';
        `);
        if (req.session.user) {
            res.json({
                state: "success",
                message: '歡迎回來',
                user: {
                    account: user[0].account,
                    name: user[0].name,
                }
            });
        } else {
            res.json({ state: "fail", message: '尚未登入' });
        }
    } catch (err) {
        console.error('Error fetching users:', err);

    }
});

app.post('/api/userGetTests', async (req, res) => {
    const data = req.body;  // req.body 會是 JSON 物件
    //資料轉換
    if (req.session.user) {
        const { TestType } = req.body;
        try {
            //const tests = await query(`SELECT * FROM UserTests where type='${TestType}'`);
            const tests = await query(`
                select *,(
                    select count(*) from userCompleteTest as b where b.tid = a.tid and account='${req.session.user}'
                ) as complete 
                from userTests as a 
                where a.type='${TestType}'
            `);
            //console.log(tests);

            const result = Object.values(
                tests.reduce((acc, item) => {
                    if (!acc[item.dept]) {
                        acc[item.dept] = {
                            dept: item.dept,
                            patients: []
                        };
                    }
                    acc[item.dept].patients.push({
                        tid: item.tid,
                        name: item.name,
                        img: '.' + item.img, // 前面加上 "." 轉為相對路徑
                        description: item.description,
                        complete: item.complete
                    });
                    return acc;
                }, {})
            );

            res.json(result)
            //res.json(_data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    }
});

app.post('/api/userGetPatientProfile', async (req, res) => {
    if (req.session.user) {
        const { tid } = req.body;
        try {
            const patientProfile = await query(`
                SELECT *,
                COALESCE(
                    (SELECT COUNT(DISTINCT times) 
                    FROM userconversationlog 
                    WHERE account = '${req.session.user}' AND tid = '${tid}'), 
                    0
                ) AS currentTimes
                FROM userGetPatientProfile where tid='${tid}';
            `);
            res.json(patientProfile[0])
            //res.json(_data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    }
});

app.post('/api/userUploadMessages', async (req, res) => {
    if (req.session.user) {
        const { tid, doctor, patient, token, currenttimes } = req.body;
        try {
            const inertMesgs = await query(`
                insert into userconversationlog
                (account, tid, status, dialog, insertTime, token, times)
                values
                ('${req.session.user}', ${tid}, 'doctor', '${doctor}', NOW(), '${token}', ${currenttimes}),
                ('${req.session.user}', ${tid}, 'patient', '${patient}', NOW() + INTERVAL '1 second','${token}', ${currenttimes});
            `);
            res.json(inertMesgs)
            //res.json(_data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    }
});

app.post('/api/userGetMessages', async (req, res) => {
    if (req.session.user) {
        const { tid, times } = req.body;
        console.log(req.body);
        try {
            const messages = await query(`
                select *, TO_CHAR(insertTime, 'AM HH12:MI:SS') AS formatted_time 
                from userconversationlog 
                where tid=${tid} and account='${req.session.user}' and times=${times} order by insertTime desc 
            `);
            res.json(messages)
            //res.json(_data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    }
});


//admin
app.post('/api/adminLogin', async (req, res) => {
    try {
        const { account, password } = req.body;
        let _data = { state: "error", account: account };
        if (account === "admin" && password === "admin") {
            req.session.admin = account; // 儲存使用者帳號到 session
            _data.state = "success";
            _data.message = '登入成功';
        } else {
            _data.state = "wrong password";
            _data.message = '密碼錯誤';
        }
            
        res.json(_data);
    } catch (err) {
        console.error('Error fetching users:', err);
    }
});

app.get('/api/adminProfile', async (req, res) => {
    try {
        if (req.session.admin) {
            res.json({
                state: "success",
                message: '歡迎回來',
                user: {
                    account: "admin",
                    name: "管理者",
                }
            });
        } else {
            res.json({ state: "fail", message: '尚未登入' });
        }
    } catch (err) {
        console.error('Error fetching users:', err);
    }
});

app.post('/api/adminGetTests', async (req, res) => {
    const data = req.body;  // req.body 會是 JSON 物件
    //資料轉換
    if (req.session.admin) {
        const { TestType } = req.body;
        try {
            const tests = await query(`select * from userTests as a  where a.type='${TestType}'`);
            const result = Object.values(
                tests.reduce((acc, item) => {
                    if (!acc[item.dept]) {
                        acc[item.dept] = {
                            dept: item.dept,
                            patients: []
                        };
                    }
                    acc[item.dept].patients.push({
                        tid: item.tid,
                        name: item.name,
                        img: '.' + item.img, // 前面加上 "." 轉為相對路徑
                        description: item.description
                    });
                    return acc;
                }, {})
            );

            res.json(result)
            //res.json(_data);
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    }
});


/*
app.get('/api/userConversationLog', async (req, res) => {
    try {
        const data = req.body;  // req.body 會是 JSON 物件
        const { tid, status, dialog } = req.body;
        if (req.session.user) {
            const users = await query(`
                insert into userConversationLog(
                    account, tid, status, dialog
                )values(
                    ${req.session.user},
                    ${tid},
                    ${status},
                    ${dialog}
                );
            `);
            res.json({ state: "success", answer: "AI回覆的內容" });
        } else {
            res.json({ state: "fail", message: '尚未登入' });
        }
    } catch (err) {
        console.error('Error fetching users:', err);

    }
});
*/
//#endregion API route example ====================================================

//#region 音檔上傳相關設定============================================================
const agent = new https.Agent({
    rejectUnauthorized: false
});
// 確保 uploads 資料夾存在
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}


// 設定 Multer 儲存位置與檔名
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname); // e.g. .mp3, .wav
        cb(null, `audio_${timestamp}${ext}`);
    }
});

// 接收音檔上傳
const upload = multer({ storage });
app.post('/api/userConversation', upload.single('audio'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, message: 'No audio file received.' });
    }

    console.log('Saved file:', req.file.path);

    const filePath = req.file.path;

    const curlCommand = `
curl -X POST https://oscewhisperapi.duckdns.org:8004/userConversation \
  -F "Account=test" \
  -F "AudioFile=@${filePath}"
`;

    await exec(curlCommand, (error, stdout, stderr) => {

        if (error) {
            console.error(`❌ 執行錯誤: ${error.message}`);
            return;
        }
        if (stderr) {
            console.error(`⚠️ 錯誤輸出: ${stderr}`);
        }

        console.log(`✅ 回應: ${stdout}`);
        res.json(stdout)
        fs.unlink(req.file.path, () => { console.log(`檔案清除${req.file.path}`)});
    });
    //res.json({ success: true, message: 'Audio uploaded successfully.', filename: req.file.filename });
    /*
    const form = new FormData();
    form.append('Account', 'test');
    form.append('AudioFile', fs.createReadStream(req.file.path), 'audio.webm');
    // 發送 POST 請求
    await fetch('https://oscewhisperapi.duckdns.org:8004/userConversation', {
        method: 'POST',
        body: form,
        agent: agent, // 設定 Agent 以跳過憑證驗證
        headers: form.getHeaders()
    })
        .then(response => response.json())
        .then(data => { console.log('回應資料:', data); res.json(data) })
        .catch(err => console.error('錯誤:', err))
        .finally(() => {
            fs.unlink(req.file.path, () => { });
        });
    */
});

//#endregion 音檔上傳相關設定===========================================================
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});