const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { spawn } = require('child_process');
const htmlProcessor = require('./utils/htmlProcessor');

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件配置
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 创建必要的目录
const uploadsDir = path.join(__dirname, 'uploads');
const outputDir = path.join(__dirname, 'output');
fs.ensureDirSync(uploadsDir);
fs.ensureDirSync(outputDir);

// 文件上传配置
const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

// 根路径 - 提供使用说明
app.get('/', (req, res) => {
  res.json({
    message: 'HTML2DOCX API 服务',
    version: '1.0.0',
    endpoints: {
      'POST /convert': '转换HTML到DOCX',
      'POST /convert/file': '上传HTML文件并转换',
      'GET /health': '健康检查'
    },
    usage: {
      method: 'POST',
      url: '/convert',
      body: {
        html: 'HTML内容字符串',
        filename: '输出文件名（可选）'
      }
    }
  });
});

// 健康检查
app.get('/health', async (req, res) => {
  const pandocStatus = await checkPandocInstallation();
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    pandoc: pandocStatus
  });
});

// 检查Pandoc是否安装
function checkPandocInstallation() {
  return new Promise((resolve) => {
    try {
      const pandoc = spawn('pandoc', ['--version'], { stdio: 'pipe' });
      pandoc.on('close', (code) => {
        resolve(code === 0 ? 'available' : 'not_installed');
      });
      pandoc.on('error', () => {
        resolve('not_installed');
      });
    } catch (error) {
      resolve('not_installed');
    }
  });
}

// HTML字符串转换接口
app.post('/convert', async (req, res) => {
  try {
    const { html, filename } = req.body;
    
    if (!html) {
      return res.status(400).json({ 
        error: '缺少HTML内容',
        message: '请在请求体中提供html字段' 
      });
    }

    const result = await convertHtmlToDocx(html, filename);
    
    if (result.success) {
      // 设置响应头让浏览器下载文件
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      
      // 发送文件并在发送完成后删除临时文件
      res.sendFile(result.filepath, (err) => {
        if (!err) {
          fs.unlink(result.filepath).catch(console.error);
          fs.unlink(result.tempHtmlPath).catch(console.error);
        }
      });
    } else {
      res.status(500).json({ 
        error: '转换失败', 
        details: result.error 
      });
    }
  } catch (error) {
    console.error('转换错误:', error);
    res.status(500).json({ 
      error: '服务器内部错误', 
      details: error.message 
    });
  }
});

// 文件上传转换接口
app.post('/convert/file', upload.single('htmlFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: '未上传文件',
        message: '请上传HTML文件' 
      });
    }

    const html = await fs.readFile(req.file.path, 'utf8');
    const filename = req.body.filename || req.file.originalname.replace(/\.[^/.]+$/, '') + '.docx';
    
    const result = await convertHtmlToDocx(html, filename);
    
    // 清理上传的文件
    fs.unlink(req.file.path).catch(console.error);
    
    if (result.success) {
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      
      res.sendFile(result.filepath, (err) => {
        if (!err) {
          fs.unlink(result.filepath).catch(console.error);
          fs.unlink(result.tempHtmlPath).catch(console.error);
        }
      });
    } else {
      res.status(500).json({ 
        error: '转换失败', 
        details: result.error 
      });
    }
  } catch (error) {
    console.error('文件转换错误:', error);
    res.status(500).json({ 
      error: '服务器内部错误', 
      details: error.message 
    });
  }
});

// HTML转DOCX核心函数
async function convertHtmlToDocx(html, filename = null) {
  const taskId = uuidv4();
  const outputFilename = filename || `converted-${taskId}.docx`;
  const tempHtmlPath = path.join(uploadsDir, `temp-${taskId}.html`);
  const outputPath = path.join(outputDir, outputFilename);

  try {
    console.log('开始处理HTML内容...');
    
    // 预处理HTML，转换MathML为LaTeX
    const processedHtml = await htmlProcessor.processHtml(html);
    
    // 保存处理后的HTML到临时文件
    await fs.writeFile(tempHtmlPath, processedHtml, 'utf8');
    
    console.log('开始Pandoc转换...');
    
    // 使用Pandoc转换
    const success = await runPandoc(tempHtmlPath, outputPath);
    
    if (success && await fs.pathExists(outputPath)) {
      console.log('转换成功完成');
      return {
        success: true,
        filename: outputFilename,
        filepath: outputPath,
        tempHtmlPath: tempHtmlPath
      };
    } else {
      throw new Error('Pandoc转换失败');
    }
  } catch (error) {
    console.error('转换过程出错:', error);
    
    // 清理临时文件
    fs.unlink(tempHtmlPath).catch(() => {});
    fs.unlink(outputPath).catch(() => {});
    
    return {
      success: false,
      error: error.message
    };
  }
}

// 运行Pandoc转换
function runPandoc(inputPath, outputPath) {
  return new Promise((resolve, reject) => {
    const args = [
      inputPath,
      '-o', outputPath,
      '--from=html',
      '--to=docx',
      '--standalone',
      '--mathml'
    ];

    console.log('执行Pandoc命令:', 'pandoc', args.join(' '));

    const pandoc = spawn('pandoc', args, {
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stderr = '';
    
    pandoc.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    pandoc.on('close', (code) => {
      if (code === 0) {
        console.log('Pandoc转换成功');
        resolve(true);
      } else {
        console.error('Pandoc转换失败，错误码:', code);
        console.error('错误信息:', stderr);
        reject(new Error(`Pandoc退出码: ${code}, 错误: ${stderr}`));
      }
    });

    pandoc.on('error', (error) => {
      console.error('Pandoc执行错误:', error);
      reject(error);
    });
  });
}

// 启动服务器
app.listen(PORT, async () => {
  console.log(`🚀 HTML2DOCX API 服务已启动`);
  console.log(`📡 服务地址: http://localhost:${PORT}`);
  console.log(`📖 使用说明: http://localhost:${PORT}`);
  
  const pandocStatus = await checkPandocInstallation();
  console.log(`🔧 Pandoc状态: ${pandocStatus}`);
  
  if (pandocStatus === 'not_installed') {
    console.log('⚠️  警告: 未检测到Pandoc，请安装Pandoc后重启服务');
    console.log('   Windows安装说明: https://pandoc.org/installing.html');
    console.log('   或者运行 install.bat 脚本进行自动安装检查');
  }
});

module.exports = app; 