# osce-csmu

## 部署 (Deployment)

本專案分為 Mac 與非 Mac 環境的部署方式。由於 Docker 本身在不同作業系統上的網路或掛載特性差異，請依據您的作業系統選擇對應的設定檔。

### 2-1. Mac 版本
適用於 macOS 使用者。

```bash
STEP1. docker-compose -f docker-compose.yaml.develop.macOS build

STEP2. echo "HOST_IP=$(ipconfig getifaddr en0)" > .env

STEP3. docker-compose -f docker-compose.yaml.develop.macOS up  -d 

STEP4. docker-compose -f docker-compose.yaml.develop.macOS down
```

### 2-2. 非 Mac 版本
適用於 Linux 使用者。

```bash
STEP1. docker-compose -f docker-compose.yaml.develop build

STEP2. echo "HOST_IP=$(hostname -I | awk '{print $1}')" > .env

STEP3. docker-compose -f docker-compose.yaml.develop up  -d 

STEP4. docker-compose -f docker-compose.yaml.develop down
```

---

## 補充說明 (Supplementary)

本專案支援模組化部署，您可以依據需求單獨啟動後端或前端服務。

### 3-1. 單獨部署 osce-backend
若只需執行後端相關服務 (包含 Backend API, Database, CoTURN, Ollama 與 Redis)，可使用以下指令：

**Mac:**
```bash

STEP1. cd osce-backend
STEP2. echo "HOST_IP=$(ipconfig getifaddr en0)" > .env
STEP2. docker-compose -f docker-compose.yaml.develop.macOS build
STEP3. docker-compose -f docker-compose.yaml.develop.macOS up -d
STEP4(關閉使用). docker-compose -f docker-compose.yaml.develop.macOS down

```

#### 測試用網址：
http://localhost:8085/talker/schema/swagger-ui/
http://localhost:8085/osce/schema/swagger-ui/
http://localhost:8085/mgmt/schema/swagger-ui/

**非 Mac:**
```bash
docker-compose -f docker-compose.yaml.develop up --build backend
```

> **注意**：`backend` 服務相依於 `ollama`，Docker Compose 會自動啟動必要的相依服務。

### 3-2. 單獨部署 osce-frontend
若只需執行前端相關服務 (包含 Frontend Build 與 Nginx 伺服器)，可使用以下指令：

**Mac:**
```bash
docker-compose -f docker-compose.yaml.develop.macOS up --build frontend nginx
```

**非 Mac:**
```bash
docker-compose -f docker-compose.yaml.develop up --build frontend nginx
```
