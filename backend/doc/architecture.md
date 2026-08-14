# FingerBookmark システムアーキテクチャ仕様書

## 目次
- [1.システム全体概要](#1-システム全体概要)
- [2.インフラ構成図](#2-インフラ構成図)
- [3.コンポーネント役割定義](#3-コンポーネント役割定義)
- [4.主要データフロー](#4-主要データフロー)
- [5.セキュリティ・認証境界](#5-セキュリティ・認証境界)

## 1. システム全体概要
- ユーザがアップロードしたPDFをAWS S3に保存し、PDFのしおり等の読書情報をDynamoDBに保存、WebブラウザからそれらバックエンドにアクセスしPDF読書体験をユーザに提供する。
- 既存のPDFリーダと異なり、複数ペインによる表示と「指」機能による素早く複数ページの切替体験を提供する。

## 2. インフラ構成図
```mermaid
    flowchart LR
    subgraph Client ["クライアント領域（Browser）"]
        FE["Next.js Frontend（画面表示・UI状態管理）"]
    end

    subgraph AWS ["Aws（Cloud）"]
        S3["Amazon S3<br>（PDFストレージ）"]
        DynamoDB["Amazon DynamoDB<br>（読書状態DB）"]
        Cognito["Amazon Cognito<br>（ユーザ認証）"]
        APIGW["Amazon API Gateway<br>（API受付窓口）"]
        Lambda["AWS Lambda<br>（ビジネスロジック/API処理）"]
    end

    FE --> |1. ログイン認証| Cognito
    FE --> |2. APIリクエスト| APIGW
    APIGW --> |3. イベント起動| Lambda
    Lambda --> |4. 署名付きURL発行| S3
    Lambda --> |5. 読書進捗の保存・取得| DynamoDB
    FE -.-> |6. 署名付きURLで直接PUT| S3
```

## 3. コンポーネント役割定義

|コンポーネント|役割・責務|
|-------------|---------|
|Next.js<br>Frontend|・画面UIの描画とユーザ操作の検知<br>・「ペイン」「指」「しおり」のメモリ上での即時制御<br>・pdf.jsを使ったPDFの高速レンダリング|
|Amazon Cognito|・ユーザの新規登録、ログイン認証<br>・安全なアクセス証明書（JWTトークン）の発行|
|Amazon APIGateway|・フロントからのREST APIリクエスト受信<br>・JWTトークンの検証（不正アクセスのブロック）<br>・CORS（クロスアクセスドメイン）の制御|
|Amazon Lambda||
|Amazon S3||
|Amazon DynamoDB||


## 4. 主要データフロー
### PDFアップロード
```mermaid
sequenceDiagram
    autonumber
    actor FE as フロントエンド (Browser)
    participant APIGW as API Gateway / Lambda
    participant S3 as Amazon S3

    FE->>APIGW: 1. 「PDFをアップロードしたい！」 (POST /presigned-url)
    Note over APIGW: 2. Lambda内で署名URLをローカル暗号計算！<br/>(S3への通信はゼロ)
    APIGW-->>FE: 3. レスポンス { uploadUrl: "https://s3...?" }
    FE->>S3: 4. 受け取った uploadUrl に直接 PUT (ファイル本体をアップロード)
```

## 5. セキュリティ・認証境界
