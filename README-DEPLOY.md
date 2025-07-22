# 🚀 Railway 部署指南

## 方法一：GitHub + Railway 自动部署（推荐）

### 1. 准备代码仓库

```bash
# 初始化Git仓库（如果还没有）
git init

# 添加所有文件
git add .

# 提交代码
git commit -m "Initial commit: HTML2DOCX API"

# 添加GitHub远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/html2docx-api.git

# 推送到GitHub
git push -u origin main
```

### 2. Railway 部署步骤

1. **注册/登录 Railway**
   - 访问：https://railway.app
   - 使用GitHub账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的 `html2docx-api` 仓库

3. **自动配置**
   - Railway会自动检测到这是Node.js项目
   - 会自动安装Pandoc（通过nixpacks.toml配置）
   - 会自动设置端口和启动命令

4. **等待部署完成**
   - 大约2-3分钟完成部署
   - 会提供一个公网URL，如：`https://你的项目名.railway.app`

### 3. 验证部署

部署完成后，访问：
- `https://你的项目名.railway.app` - API首页
- `https://你的项目名.railway.app/health` - 健康检查

---

## 方法二：Railway CLI 部署

### 1. 安装Railway CLI

```bash
# 使用npm安装
npm install -g @railway/cli

# 或使用其他方式
# curl -fsSL https://railway.app/install.sh | sh
```

### 2. 登录Railway

```bash
railway login
```

### 3. 初始化和部署

```bash
# 在项目目录中初始化
railway init

# 部署项目
railway up
```

---

## 方法三：Docker 部署（高级用户）

### 1. 构建Docker镜像

```bash
# 构建镜像
docker build -t html2docx-api .

# 本地测试
docker run -p 3000:3000 html2docx-api
```

### 2. 部署到Railway

1. 将Dockerfile推送到GitHub
2. 在Railway中选择 "Deploy from GitHub repo"
3. Railway会自动识别Dockerfile并构建

---

## 🔧 环境变量配置

在Railway Dashboard中可以设置以下环境变量：

```bash
NODE_ENV=production
PORT=3000  # Railway会自动设置，通常不需要手动配置
```

---

## 📊 监控和日志

### 查看应用日志
```bash
# 使用Railway CLI
railway logs

# 或在Railway Dashboard中查看
```

### 监控健康状态
- 访问：`https://你的域名/health`
- 检查Pandoc状态和API运行情况

---

## 🌍 自定义域名（可选）

1. 在Railway Dashboard中进入你的项目
2. 点击 "Settings" → "Domains"
3. 添加自定义域名
4. 配置DNS CNAME记录

---

## 🔄 自动部署

一旦设置完成，每次推送代码到GitHub主分支：
```bash
git add .
git commit -m "更新功能"
git push origin main
```

Railway会自动：
1. 检测代码变更
2. 重新构建应用
3. 部署新版本
4. 切换流量到新版本

---

## ❗ 常见问题

### 1. Pandoc未安装
- 确保 `nixpacks.toml` 文件存在
- 检查 `nixPkgs = ["nodejs_18", "pandoc"]` 配置

### 2. 内存不足
- Railway免费版有512MB内存限制
- 如需更多资源，可升级到付费版

### 3. 端口问题
- Railway会自动设置 `PORT` 环境变量
- 确保代码中使用 `process.env.PORT || 3000`

### 4. 文件上传限制
- Railway默认临时文件系统
- 大文件建议使用外部存储（如AWS S3）

---

## 💰 费用说明

**Railway 免费版限制：**
- 512MB 内存
- 1GB 网络传输/月
- 500小时运行时间/月

**付费版优势：**
- 更多内存和CPU
- 无限网络传输
- 24/7运行
- 优先支持

---

## 🎯 部署成功验证

部署成功后，你的API将提供以下功能：

1. **Web界面**：`https://你的域名` 
2. **API转换**：`POST https://你的域名/convert`
3. **健康检查**：`GET https://你的域名/health`
4. **文件上传**：`POST https://你的域名/convert/file`

完美支持MathML数学公式转换，默认宋体字体！ 