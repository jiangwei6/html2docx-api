# HTML2DOCX API 接入说明文档

## 📖 概述

**API基础信息**
- **服务地址**: `https://html2docx-api-production.up.railway.app`
- **协议**: HTTPS
- **返回格式**: JSON (状态信息) / Binary (文件流)
- **字符编码**: UTF-8
- **请求大小限制**: 50MB

---

## 🔧 API端点详情

### 1. 健康检查

**获取API服务状态和Pandoc安装情况**

```http
GET /health
```

**响应示例**:
```json
{
  "status": "ok",
  "timestamp": "2025-01-22T10:40:44.000Z",
  "pandoc": "available"
}
```

**字段说明**:
- `status`: 服务状态 (`ok` | `error`)
- `timestamp`: 检查时间 (ISO 8601格式)
- `pandoc`: Pandoc状态 (`available` | `not_installed`)

---

### 2. HTML字符串转换

**将HTML内容转换为DOCX文件**

```http
POST /convert
Content-Type: application/json
```

**请求参数**:
```json
{
  "html": "HTML内容字符串",
  "filename": "输出文件名.docx"  // 可选，默认为generated.docx
}
```

**参数说明**:
- `html` (必需): 包含MathML的HTML内容
- `filename` (可选): 输出的DOCX文件名

**响应类型**: 
- **成功**: `application/vnd.openxmlformats-officedocument.wordprocessingml.document` (二进制文件流)
- **失败**: `application/json` (错误信息)

**成功响应头**:
```http
HTTP/1.1 200 OK
Content-Type: application/vnd.openxmlformats-officedocument.wordprocessingml.document
Content-Disposition: attachment; filename="your-file.docx"
```

**错误响应示例**:
```json
{
  "error": "缺少HTML内容",
  "message": "请在请求体中提供html字段"
}
```

---

### 3. 文件上传转换

**上传HTML文件并转换为DOCX**

```http
POST /convert/file
Content-Type: multipart/form-data
```

**表单字段**:
- `htmlFile` (必需): HTML文件
- `filename` (可选): 输出文件名

**响应**: 与HTML字符串转换相同

---

## 📁 文件返回机制说明

### ❓ **关于您的问题**

> API返回的DOCX文件自动下载是前端功能还是API功能？返回的是base64还是URL？

**答案**：
1. **API返回**: 二进制文件流 (不是base64，不是URL)
2. **自动下载**: 前端JavaScript实现的功能
3. **返回格式**: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### 🔧 **具体实现机制**

**API端**:
```javascript
// 设置响应头
res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
res.setHeader('Content-Disposition', 'attachment; filename="example.docx"');

// 直接发送文件流
res.sendFile(filePath);
```

**前端自动下载**:
```javascript
// 接收二进制数据
const blob = await response.blob();

// 创建临时URL
const url = window.URL.createObjectURL(blob);

// 创建下载链接并触发下载
const a = document.createElement('a');
a.href = url;
a.download = 'filename.docx';
a.click();

// 清理临时URL
window.URL.revokeObjectURL(url);
```

---

## 💻 编程语言接入示例

### JavaScript/Node.js

```javascript
const fs = require('fs');
const axios = require('axios');

async function convertHtmlToDocx(html, outputPath) {
  try {
    const response = await axios.post(
      'https://html2docx-api-production.up.railway.app/convert',
      {
        html: html,
        filename: 'output.docx'
      },
      {
        responseType: 'stream',  // 重要：指定为stream
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // 保存文件
    const writer = fs.createWriteStream(outputPath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (error) {
    throw new Error(`转换失败: ${error.message}`);
  }
}

// 使用示例
const html = '<p>测试内容<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mi>a</mi><mi>b</mi></mfrac></math></p>';
convertHtmlToDocx(html, './output.docx');
```

### Python

```python
import requests
import json

def convert_html_to_docx(html_content, output_path, filename="output.docx"):
    """
    转换HTML到DOCX
    
    Args:
        html_content: HTML内容字符串
        output_path: 输出文件路径
        filename: 文件名
    """
    url = "https://html2docx-api-production.up.railway.app/convert"
    
    payload = {
        "html": html_content,
        "filename": filename
    }
    
    headers = {
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, data=json.dumps(payload), headers=headers)
        
        if response.status_code == 200:
            with open(output_path, 'wb') as f:
                f.write(response.content)
            print(f"转换成功: {output_path}")
        else:
            error_info = response.json()
            print(f"转换失败: {error_info.get('error', '未知错误')}")
            
    except Exception as e:
        print(f"请求错误: {str(e)}")

# 使用示例
html = '''
<p>物理公式：</p>
<p><math xmlns="http://www.w3.org/1998/Math/MathML">
    <mi>E</mi><mo>=</mo><mi>m</mi><msup><mi>c</mi><mn>2</mn></msup>
</math></p>
'''

convert_html_to_docx(html, "./physics.docx")
```

### PHP

```php
<?php
function convertHtmlToDocx($html, $outputPath, $filename = 'output.docx') {
    $url = 'https://html2docx-api-production.up.railway.app/convert';
    
    $data = json_encode([
        'html' => $html,
        'filename' => $filename
    ]);
    
    $options = [
        'http' => [
            'header' => "Content-Type: application/json\r\n",
            'method' => 'POST',
            'content' => $data
        ]
    ];
    
    $context = stream_context_create($options);
    $result = file_get_contents($url, false, $context);
    
    if ($result !== FALSE) {
        file_put_contents($outputPath, $result);
        echo "转换成功: $outputPath\n";
    } else {
        echo "转换失败\n";
    }
}

// 使用示例
$html = '<p>测试<math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mi>a</mi><mi>b</mi></mfrac></math></p>';
convertHtmlToDocx($html, './test.docx');
?>
```

### Java

```java
import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;

public class HtmlToDocxConverter {
    
    public static void convertHtmlToDocx(String html, String outputPath, String filename) {
        try {
            URL url = new URL("https://html2docx-api-production.up.railway.app/convert");
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/json");
            conn.setDoOutput(true);
            
            // 构建JSON数据
            String jsonData = String.format(
                "{\"html\":\"%s\",\"filename\":\"%s\"}", 
                html.replace("\"", "\\\""), 
                filename
            );
            
            // 发送数据
            try (OutputStream os = conn.getOutputStream()) {
                byte[] input = jsonData.getBytes(StandardCharsets.UTF_8);
                os.write(input, 0, input.length);
            }
            
            // 接收响应
            if (conn.getResponseCode() == 200) {
                try (InputStream is = conn.getInputStream();
                     FileOutputStream fos = new FileOutputStream(outputPath)) {
                    
                    byte[] buffer = new byte[1024];
                    int bytesRead;
                    while ((bytesRead = is.read(buffer)) != -1) {
                        fos.write(buffer, 0, bytesRead);
                    }
                }
                System.out.println("转换成功: " + outputPath);
            } else {
                System.out.println("转换失败，状态码: " + conn.getResponseCode());
            }
            
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    public static void main(String[] args) {
        String html = "<p>测试内容</p>";
        convertHtmlToDocx(html, "./output.docx", "test.docx");
    }
}
```

### curl命令行

```bash
# 基本转换
curl -X POST "https://html2docx-api-production.up.railway.app/convert" \
  -H "Content-Type: application/json" \
  -d '{"html":"<p>测试内容</p>","filename":"test.docx"}' \
  --output test.docx

# 文件上传转换
curl -X POST "https://html2docx-api-production.up.railway.app/convert/file" \
  -F "htmlFile=@input.html" \
  -F "filename=output.docx" \
  --output output.docx

# 健康检查
curl "https://html2docx-api-production.up.railway.app/health"
```

---

## 🧮 MathML 支持说明

### 支持的MathML元素

| 元素 | 描述 | 示例 |
|------|------|------|
| `<mi>` | 标识符 | `<mi>x</mi>` → x |
| `<mn>` | 数字 | `<mn>123</mn>` → 123 |
| `<mo>` | 操作符 | `<mo>+</mo>` → + |
| `<mfrac>` | 分数 | `<mfrac><mi>a</mi><mi>b</mi></mfrac>` → a/b |
| `<msup>` | 上标 | `<msup><mi>x</mi><mn>2</mn></msup>` → x² |
| `<msub>` | 下标 | `<msub><mi>x</mi><mn>1</mn></msub>` → x₁ |
| `<msubsup>` | 上下标 | `<msubsup><mi>x</mi><mn>1</mn><mn>2</mn></msubsup>` → x₁² |
| `<mmultiscripts>` | 多重上下标 | 化学元素符号如 ¹²C |
| `<msqrt>` | 平方根 | `<msqrt><mi>x</mi></msqrt>` → √x |
| `<mrow>` | 行分组 | 组织复杂表达式 |
| `<mtext>` | 文本 | `<mtext>sin</mtext>` → sin |

### MathML示例

```xml
<!-- 二次方程解 -->
<math xmlns="http://www.w3.org/1998/Math/MathML">
  <mi>x</mi>
  <mo>=</mo>
  <mfrac>
    <mrow>
      <mo>-</mo><mi>b</mi><mo>±</mo>
      <msqrt>
        <mrow>
          <msup><mi>b</mi><mn>2</mn></msup>
          <mo>-</mo>
          <mn>4</mn><mi>a</mi><mi>c</mi>
        </mrow>
      </msqrt>
    </mrow>
    <mrow><mn>2</mn><mi>a</mi></mrow>
  </mfrac>
</math>

<!-- 化学元素 -->
<math xmlns="http://www.w3.org/1998/Math/MathML">
  <mmultiscripts>
    <mi>C</mi>
    <mprescripts />
    <mn>12</mn>
  </mmultiscripts>
</math>
```

---

## ⚠️ 重要注意事项

### 1. 请求限制
- **文件大小**: 最大50MB
- **并发请求**: 建议间隔1秒以上
- **超时时间**: 30秒

### 2. MathML要求
- 必须包含命名空间: `xmlns="http://www.w3.org/1998/Math/MathML"`
- 确保XML格式正确，标签配对
- 避免使用非标准MathML元素

### 3. 字体设置
- 默认使用宋体字体
- 字号：12pt
- 行距：1.5倍

### 4. 错误处理
- API返回JSON错误信息时，状态码为4xx或5xx
- 检查响应的`Content-Type`来判断是文件还是错误信息

---

## 🔍 故障排除

### 常见问题

**1. 转换失败，返回400错误**
- 检查HTML内容是否为空
- 确认Content-Type为application/json
- 验证JSON格式是否正确

**2. MathML公式不显示**
- 确认包含正确的命名空间
- 检查MathML语法是否正确
- 避免使用过于复杂的嵌套结构

**3. 文件下载失败**
- 确认响应类型为stream/blob
- 检查文件路径权限
- 验证文件大小是否合理

**4. 502/503错误**
- 服务可能正在重启，稍后重试
- 检查API健康状态：`GET /health`

---

## 📞 联系支持

如需技术支持或有问题反馈：

1. 检查API健康状态
2. 查看错误返回信息
3. 验证MathML格式
4. 确认请求参数正确

---

## 🎯 最佳实践

1. **错误处理**: 始终检查响应状态码和类型
2. **文件管理**: 及时清理临时文件
3. **请求频率**: 避免过于频繁的API调用
4. **内容验证**: 转换前验证HTML和MathML格式
5. **超时设置**: 设置合理的请求超时时间（建议30秒）

---

**API版本**: v1.0.0  
**文档更新**: 2025年1月22日 