# osce-csmu

## 部署 (Deployment)

本專案分為 Mac 與非 Mac 環境的部署方式。由於 Docker 本身在不同作業系統上的網路或掛載特性差異，請依據您的作業系統選擇對應的設定檔。

### Mac 版本
適用於 macOS 使用者。

```bash
STEP1. check models and checkpoints
## https://huggingface.co/kidd1214/whisper-v3-ct2
## https://huggingface.co/kidd1214/linly_talker_checkpoints

STEP2. echo "HOST_IP=$(curl -s ifconfig.me)" > .env

STEP3. docker-compose -f docker-compose.yaml.develop.macOS build

STEP4. docker-compose -f docker-compose.yaml.develop.macOS up  -d 

STEP5. docker-compose -f docker-compose.yaml.develop.macOS down

需確認：.env中的HOST_IP是否與前端.env.user中的VITE_TURN_SERVER_DEV一致(port一律為3433)

### 2-2. 非 Mac 版本
適用於 Linux 使用者。

STEP1. check models and checkpoints
## https://huggingface.co/kidd1214/whisper-v3-ct2
## https://huggingface.co/kidd1214/linly_talker_checkpoints

STEP2. echo "HOST_IP=$(hostname -I | awk '{print $1}')" > .env

STEP3. docker-compose -f docker-compose.yaml.develop build

STEP4. docker-compose -f docker-compose.yaml.develop up  -d 

STEP5. docker-compose -f docker-compose.yaml.develop down

需確認：.env中的HOST_IP是否與前端.env.user中的VITE_TURN_SERVER_DEV一致(port一律為3433)
```

---

## 補充說明 (Supplementary)

本專案支援模組化部署，您可以依據需求單獨啟動後端。

### 單獨部署 osce-backend
若只需執行後端相關服務 (包含 Backend API, Database, CoTURN, Ollama 與 Redis)，可使用以下指令：

#### 測試用網址：
http://localhost:8010/talker/schema/swagger-ui/
http://localhost:8010/osce/schema/swagger-ui/
http://localhost:8010/mgmt/schema/swagger-ui/

**Linux:**
```bash

STEP1. cd osce-backend
STEP2. check osce-backend/models 是否有
    1. whisper-v3-ct2/config.json
    2. whisper-v3-ct2/model.bin
    3. whisper-v3-ct2/vocabulary.json
    4. whisper-v3-ct2/preprocessor_config.json
    5. whisper-v3-ct2/tokenizer_config.json
## https://huggingface.co/kidd1214/whisper-v3-ct2/whisper-v3-ct2
STEP3. check osce-backend/backend_api/linly_talker/checkpoints 是否有
    1. GFPGANv1.4.pth
    2. mapping_00109-model.pth.tar
    3. mapping_00229-model.pth.tar
    4. SadTalker_V0.0.2_256.safetensors
## https://huggingface.co/kidd1214/linly_talker_checkpoints/linly_talker_checkpoints
STEP4. echo "HOST_INNER_IP=$(hostname -I | awk '{print $1}')
HOST_OUTER_IP=$(curl -s ifconfig.me)" > .env

STEP5. docker-compose -f docker-compose.yaml.release build
STEP6. docker-compose -f docker-compose.yaml.release up -d
STEP7. check ollama 是否有 model = alibayram/medgemma
# curl http://localhost:11333/api/generate -d '{"model": "alibayram/medgemma", "prompt": "hi"}'
# 若不存在 docker exec -it osce-ollama-only-dev ollama run alibayram/medgemma
STEP8 (關閉使用). docker-compose -f docker-compose.yaml.release down

```

#### 測試用網址：
http://localhost:8010/talker/schema/swagger-ui/
http://localhost:8010/osce/schema/swagger-ui/
http://localhost:8010/mgmt/schema/swagger-ui/


### 前端開發：
請確保
1. .env.user的
    1-1. VITE_STUN_SERVER_DEV = stun:${HOST_IP}:3433 # Host id 就是你電腦當下的ip
    1-2. VITE_TURN_SERVER_DEV = turn:${HOST_IP}:3433
    1-3. VITE_TURN_USERNAME_DEV = osce
    1-4. VITE_TURN_CREDENTIAL_DEV = osce
    1-5. VITE_API_BASE_DEV = http://localhost:8010
    1-6. VITE_WS_BASE_DEV = ws://localhost:8010

### 如果MacOS無法使用docker-compose build，請手動pull image
```bash
    STEP1. docker pull ollama/ollama:0.15.5-rc3
    STEP2. docker pull coturn/coturn:4.6.2 
    STEP3. docker pull kidd1214/osce-backend-backend:20260303
    STEP4. docker tag kidd1214/osce-backend-backend:20260303 osce-backend-backend:latest
    STEP5. docker-compose -f docker-compose.yaml.develop.macOS up -d
```