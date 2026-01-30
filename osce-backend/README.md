# CSMU_OSCE Backend API

## 專案簡介

本專案提供 OSCE（Objective Structured Clinical Examination）醫學模擬考試平台的核心後端 API，包含標準病人管理、科室資料、病史與測驗資料等模組。支援使用者認證、權限管控以及 RESTful 資料存取，並整合自動化 OpenAPI 規格說明文件。

## 系統需求

- Python 3.13
- SQLite


## 安裝依賴

請執行以下指令以安裝主要依賴套件：

```bash
pip install -r requirement.txt
```


### requirement.txt 內容

- djangorestframework 3.16.1
- Django 5.2.6
- drf-spectacular 0.28.0
- django-cors-headers 4.9.0
- drf-writable-nested 0.7.2
- gunicorn 23.0.0
- requests 2.32.5
- arrow 1.3.0
- pillow 11.3.0
- yarl 1.22.0
- rules 3.5
- djangorestframework-simplejwt 5.5.1


## 啟動方法

1. 建立 Django 專案設定與資料庫 migration。
2. 啟動測試伺服器：
```bash
python manage.py runserver
```


## 主要功能模組

- 標準病人 StandardizedPatient CRUD \& 列表查詢
- 科室 Department CRUD、病史與考題關聯查詢
- 病史 MedicalHistory 資料管理
- 測驗 Test CRUD 與查詢
- 使用者管理(註冊、認證、登入、登出)


## 認證與權限

-  Token 驗證支援
-  API 權限控管（IsAuthenticated、AllowAny）


## API 文件瀏覽

使用 drf-spectacular 產生 OpenAPI 規格（Swagger/YAML/JSON），可於 `/api/schema` 路徑檢視完整 API 端點與參數說明。


