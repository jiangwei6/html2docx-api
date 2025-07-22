# HTML2DOCX API 服务

一个强大的HTML到DOCX转换API服务，特别针对包含MathML数学公式的HTML内容进行了优化，能够完美转换复杂的数学公式。

## 🌟 主要特性

- 🔄 **HTML到DOCX完美转换**：支持复杂的HTML结构转换
- 🧮 **MathML公式支持**：完美处理MathML数学公式，转换为Word支持的格式
- 🚀 **RESTful API**：简单易用的API接口
- 📁 **多种输入方式**：支持直接传入HTML字符串或上传HTML文件
- 🔧 **基于Pandoc**：使用业界标准的Pandoc进行转换
- 🌐 **跨平台支持**：支持Windows、macOS、Linux

## 📋 环境要求

### 必需软件

1. **Node.js** (v14.0.0 或更高版本)
   - 下载地址: https://nodejs.org/

2. **Pandoc** (v2.0 或更高版本)
   - Windows: 下载 .msi 安装包 https://pandoc.org/installing.html
   - macOS: `brew install pandoc`
   - Linux: `sudo apt-get install pandoc` 或 `sudo yum install pandoc`

### 验证安装

```bash
# 检查Node.js版本
node --version

# 检查Pandoc版本
pandoc --version
```

## 🚀 快速开始

### 1. 安装依赖

```bash
# 安装项目依赖
npm install
```

### 2. 启动服务

```bash
# 启动API服务
npm start

# 或者使用开发模式（自动重启）
npm run dev
```

服务启动后将运行在 `http://localhost:3000`

### 3. 测试服务

```bash
# 运行测试脚本
npm test
```

## 📖 API 使用说明

### 基础信息

- **服务地址**: `http://localhost:3000`
- **支持的输入格式**: HTML (包含MathML)
- **输出格式**: DOCX (Microsoft Word文档)

### API 端点

#### 1. 获取服务信息

```http
GET /
```

返回API服务的基本信息和使用说明。

#### 2. 健康检查

```http
GET /health
```

检查服务状态和Pandoc安装情况。

#### 3. HTML字符串转换

```http
POST /convert
Content-Type: application/json

{
  "html": "<p>您的HTML内容</p>",
  "filename": "输出文件名.docx"  // 可选
}
```

**示例请求**:

```javascript
const response = await fetch('http://localhost:3000/convert', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    html: '<p>包含<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mi>a</mi><mi>b</mi></mfrac></math>的数学公式</p>',
    filename: 'math-document.docx'
  })
});

// 下载文件
const blob = await response.blob();
```

#### 4. HTML文件上传转换

```http
POST /convert/file
Content-Type: multipart/form-data

表单字段:
- htmlFile: HTML文件
- filename: 输出文件名 (可选)
```

**示例（使用curl）**:

```bash
curl -X POST \
  -F "htmlFile=@your-file.html" \
  -F "filename=converted.docx" \
  http://localhost:3000/convert/file \
  --output converted.docx
```

## 🧮 MathML 支持说明

本服务特别针对MathML数学公式进行了优化，支持以下MathML元素：

- `<math>` - 数学根元素
- `<mi>` - 标识符
- `<mn>` - 数字
- `<mo>` - 操作符
- `<mfrac>` - 分数
- `<msup>` - 上标
- `<msub>` - 下标
- `<mmultiscripts>` - 多重上下标（如化学元素表示法）
- `<mrow>` - 行分组
- `<mtext>` - 文本

### 转换示例

**输入MathML**:
```xml
<math xmlns="http://www.w3.org/1998/Math/MathML">
  <mfrac>
    <mrow><mn>12</mn><mi>b</mi></mrow>
    <mi>a</mi>
  </mfrac>
</math>
```

**转换为LaTeX**: `$\frac{12b}{a}$`

**最终在Word中显示**: 正确的数学公式格式

## 📁 项目结构

```
html2doc/
├── server.js              # 主服务器文件
├── utils/
│   └── htmlProcessor.js   # HTML处理和MathML转换工具
├── package.json           # 项目配置
├── test.js               # 测试脚本
├── README.md             # 项目说明
├── uploads/              # 临时上传目录（自动创建）
└── output/               # 输出目录（自动创建）
```

## 🔧 配置选项

### 环境变量

- `PORT`: 服务端口号（默认: 3000）

### 服务配置

在 `server.js` 中可以修改以下配置：

- 上传文件大小限制（默认: 50MB）
- 临时文件存储路径
- Pandoc转换参数

## 🧪 测试

项目包含完整的测试脚本，测试以下功能：

1. 服务健康检查
2. API信息获取
3. HTML字符串转换
4. HTML文件上传转换

运行测试：

```bash
npm test
```

测试将使用您提供的化学题目作为示例进行转换测试。

## ❗ 常见问题

### 1. Pandoc未安装

**错误**: `Pandoc退出码: 127` 或 `pandoc: command not found`

**解决**: 安装Pandoc
- Windows: 下载并安装 https://pandoc.org/installing.html
- macOS: `brew install pandoc`
- Linux: `sudo apt-get install pandoc`

### 2. 转换失败

**错误**: 转换过程中出现错误

**解决步骤**:
1. 检查HTML格式是否正确
2. 确保MathML标签完整
3. 查看服务器日志获取详细错误信息

### 3. 公式显示不正确

**原因**: MathML结构复杂或包含不支持的元素

**解决**: 
- 检查MathML是否符合标准
- 查看日志中的转换详情
- 考虑简化复杂的MathML结构

### 4. 文件上传失败

**原因**: 文件过大或格式不正确

**解决**:
- 确保文件小于50MB
- 确保文件是有效的HTML格式
- 检查文件编码（推荐UTF-8）

## 🚀 部署到生产环境

### Railway 部署示例

1. 创建 `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

2. 添加系统依赖到 `package.json`:

```json
{
  "nixpacks": {
    "packages": ["pandoc"]
  }
}
```

### Docker 部署

创建 `Dockerfile`:

```dockerfile
FROM node:16-alpine

# 安装Pandoc
RUN apk add --no-cache pandoc

WORKDIR /app
COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000
CMD ["npm", "start"]
```

## 📞 技术支持

如果您在使用过程中遇到问题：

1. 查看本文档的常见问题部分
2. 运行测试脚本检查环境
3. 查看服务器控制台日志
4. 确保所有依赖软件正确安装

## 📄 许可证

MIT License

---

## 🎯 使用示例

以下是一个完整的使用示例，演示如何转换包含复杂数学公式的化学题目：

```javascript
const axios = require('axios');
const fs = require('fs');

const chemistryHtml = `
<p>已知一个<math xmlns="http://www.w3.org/1998/Math/MathML">
<mmultiscripts><mi>C</mi><mprescripts /><mn>12</mn></mmultiscripts>
</math>原子的质量为a kg，则相对原子质量为：</p>

<p><math xmlns="http://www.w3.org/1998/Math/MathML">
<mfrac><mrow><mn>12</mn><mi>b</mi></mrow><mi>a</mi></mfrac>
</math></p>
`;

async function convertChemistry() {
  try {
    const response = await axios.post('http://localhost:3000/convert', {
      html: chemistryHtml,
      filename: 'chemistry-problem.docx'
    }, {
      responseType: 'stream'
    });
    
    const writer = fs.createWriteStream('chemistry-problem.docx');
    response.data.pipe(writer);
    
    writer.on('finish', () => {
      console.log('✅ 化学题目转换完成！');
    });
  } catch (error) {
    console.error('❌ 转换失败:', error.message);
  }
}

convertChemistry();
```

转换后的DOCX文件将包含正确格式的数学公式，可以在Microsoft Word中完美显示。 