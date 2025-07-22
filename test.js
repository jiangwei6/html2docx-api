const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

// 测试HTML内容（用户提供的示例）
const testHtml = `
<p>以下是一道关于物质构成的化学选择题：</p>

<p>已知一个<math xmlns="http://www.w3.org/1998/Math/MathML"><mmultiscripts><mi>C</mi><mprescripts /><mn>12</mn></mmultiscripts></math>原子(含6个质子，6个中子)的质量为a kg，一个<math xmlns="http://www.w3.org/1998/Math/MathML"><mmultiscripts><mi>X</mi><mprescripts /><mn>A</mn></mmultiscripts></math>原子的质量为b kg，则元素X的相对原子质量为(&nbsp;&nbsp;&nbsp;&nbsp;)</p>

<p>A. <math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mrow><mn>12</mn><mi>b</mi></mrow><mi>a</mi></mfrac></math>&nbsp;&nbsp;&nbsp;&nbsp;B. <math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mrow><mn>12</mn><mi>a</mi></mrow><mi>b</mi></mfrac></math></p>

<p>C. <math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mi>b</mi><mrow><mn>12</mn><mi>a</mi></mrow></mfrac></math>&nbsp;&nbsp;&nbsp;&nbsp;D. <math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mi>a</mi><mrow><mn>12</mn><mi>b</mi></mrow></mfrac></math></p>

<p><strong>答案：A</strong></p>

<p><strong>解析：</strong>相对原子质量是以一个<math xmlns="http://www.w3.org/1998/Math/MathML"><mmultiscripts><mi>C</mi><mprescripts /><mn>12</mn></mmultiscripts></math>原子质量的1/12作为标准，其他原子的质量跟它相比较所得到的比。</p>
<p>根据定义，元素X的相对原子质量计算公式为：<br>
<math xmlns="http://www.w3.org/1998/Math/MathML"><mtext>相对原子质量</mtext><mo>=</mo><mfrac><mtext>一个X原子的实际质量</mtext><mrow><mtext>一个</mtext><mmultiscripts><mi>C</mi><mprescripts /><mn>12</mn></mmultiscripts><mtext>原子质量</mtext><mo>×</mo><mfrac><mn>1</mn><mn>12</mn></mfrac></mrow></mfrac><mo>=</mo><mfrac><mi>b</mi><mrow><mi>a</mi><mo>×</mo><mfrac><mn>1</mn><mn>12</mn></mfrac></mrow></mfrac><mo>=</mo><mfrac><mrow><mn>12</mn><mi>b</mi></mrow><mi>a</mi></mfrac></math></p>
`;

async function testApi() {
  const API_BASE_URL = 'http://localhost:3000';
  
  try {
    console.log('🧪 开始测试HTML2DOCX API...\n');
    
    // 1. 测试健康检查
    console.log('1. 测试健康检查...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ 健康检查通过:', healthResponse.data);
    console.log('');
    
    // 2. 测试根路径（获取API说明）
    console.log('2. 获取API使用说明...');
    const rootResponse = await axios.get(API_BASE_URL);
    console.log('✅ API说明:', rootResponse.data);
    console.log('');
    
    // 3. 测试HTML转换
    console.log('3. 测试HTML转DOCX转换...');
    const convertResponse = await axios.post(`${API_BASE_URL}/convert`, {
      html: testHtml,
      filename: 'chemistry-test.docx'
    }, {
      responseType: 'stream'
    });
    
    // 保存转换结果
    const outputPath = path.join(__dirname, 'test-output.docx');
    const writer = fs.createWriteStream(outputPath);
    
    convertResponse.data.pipe(writer);
    
    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
    
    console.log('✅ HTML转换成功！');
    console.log(`📄 输出文件: ${outputPath}`);
    
    // 检查文件大小
    const stats = await fs.stat(outputPath);
    console.log(`📊 文件大小: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log('');
    
    // 4. 创建测试HTML文件并测试文件上传
    console.log('4. 测试文件上传转换...');
    const testHtmlPath = path.join(__dirname, 'test-input.html');
    await fs.writeFile(testHtmlPath, testHtml, 'utf8');
    
    const FormData = require('form-data');
    const form = new FormData();
    form.append('htmlFile', fs.createReadStream(testHtmlPath));
    form.append('filename', 'chemistry-upload-test.docx');
    
    const uploadResponse = await axios.post(`${API_BASE_URL}/convert/file`, form, {
      headers: form.getHeaders(),
      responseType: 'stream'
    });
    
    const uploadOutputPath = path.join(__dirname, 'test-upload-output.docx');
    const uploadWriter = fs.createWriteStream(uploadOutputPath);
    
    uploadResponse.data.pipe(uploadWriter);
    
    await new Promise((resolve, reject) => {
      uploadWriter.on('finish', resolve);
      uploadWriter.on('error', reject);
    });
    
    console.log('✅ 文件上传转换成功！');
    console.log(`📄 输出文件: ${uploadOutputPath}`);
    
    const uploadStats = await fs.stat(uploadOutputPath);
    console.log(`📊 文件大小: ${(uploadStats.size / 1024).toFixed(2)} KB`);
    
    // 清理测试文件
    await fs.unlink(testHtmlPath);
    
    console.log('\n🎉 所有测试通过！API服务工作正常');
    
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
    
    if (error.response) {
      console.error('错误响应:', error.response.data);
    }
    
    if (error.code === 'ECONNREFUSED') {
      console.error('💡 请确保API服务已启动: npm start');
    }
  }
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  testApi();
}

module.exports = { testApi, testHtml }; 