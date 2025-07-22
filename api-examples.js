// HTML2DOCX API 调用示例
// 部署地址：https://html2docx-api-production.up.railway.app

const API_BASE = 'https://html2docx-api-production.up.railway.app';

// ============================================
// 示例1：转换包含MathML的化学题目
// ============================================
async function convertChemistryProblem() {
    console.log('📚 示例1：转换化学题目');
    
    const chemistryHtml = `
<p>以下是一道关于物质构成的化学选择题：</p>

<p>已知一个<math xmlns="http://www.w3.org/1998/Math/MathML"><mmultiscripts><mi>C</mi><mprescripts /><mn>12</mn></mmultiscripts></math>原子(含6个质子，6个中子)的质量为a kg，一个<math xmlns="http://www.w3.org/1998/Math/MathML"><mmultiscripts><mi>X</mi><mprescripts /><mn>A</mn></mmultiscripts></math>原子的质量为b kg，则元素X的相对原子质量为(&nbsp;&nbsp;&nbsp;&nbsp;)</p>

<p>A. <math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mrow><mn>12</mn><mi>b</mi></mrow><mi>a</mi></mfrac></math>&nbsp;&nbsp;&nbsp;&nbsp;B. <math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mrow><mn>12</mn><mi>a</mi></mrow><mi>b</mi></mfrac></math></p>

<p>C. <math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mi>b</mi><mrow><mn>12</mn><mi>a</mi></mrow></mfrac></math>&nbsp;&nbsp;&nbsp;&nbsp;D. <math xmlns="http://www.w3.org/1998/Math/MathML"><mfrac><mi>a</mi><mrow><mn>12</mn><mi>b</mi></mrow></mfrac></math></p>

<p><strong>答案：A</strong></p>

<p><strong>解析：</strong>相对原子质量是以一个<math xmlns="http://www.w3.org/1998/Math/MathML"><mmultiscripts><mi>C</mi><mprescripts /><mn>12</mn></mmultiscripts></math>原子质量的1/12作为标准，其他原子的质量跟它相比较所得到的比。</p>
    `;

    try {
        const response = await fetch(`${API_BASE}/convert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                html: chemistryHtml,
                filename: 'chemistry-problem.docx'
            })
        });

        if (response.ok) {
            // 下载文件
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'chemistry-problem.docx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            console.log('✅ 化学题目转换成功！');
        } else {
            const errorData = await response.json();
            console.error('❌ 转换失败:', errorData);
        }
    } catch (error) {
        console.error('❌ 请求错误:', error);
    }
}

// ============================================
// 示例2：检查API健康状态
// ============================================
async function checkApiHealth() {
    console.log('🏥 示例2：检查API健康状态');
    
    try {
        const response = await fetch(`${API_BASE}/health`);
        const data = await response.json();
        
        console.log('✅ 健康检查结果:', {
            status: data.status,
            pandoc: data.pandoc,
            timestamp: new Date(data.timestamp).toLocaleString()
        });
        
        return data.pandoc === 'available';
    } catch (error) {
        console.error('❌ 健康检查失败:', error);
        return false;
    }
}

// ============================================
// 示例3：转换数学公式
// ============================================
async function convertMathFormulas() {
    console.log('📐 示例3：转换数学公式');
    
    const mathHtml = `
<h2>数学公式示例</h2>

<p>二次方程的解：</p>
<p><math xmlns="http://www.w3.org/1998/Math/MathML">
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
</math></p>

<p>圆的面积公式：</p>
<p><math xmlns="http://www.w3.org/1998/Math/MathML">
    <mi>S</mi>
    <mo>=</mo>
    <mi>π</mi>
    <msup><mi>r</mi><mn>2</mn></msup>
</math></p>
    `;

    try {
        const response = await fetch(`${API_BASE}/convert`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                html: mathHtml,
                filename: 'math-formulas.docx'
            })
        });

        if (response.ok) {
            const blob = await response.blob();
            console.log('✅ 数学公式转换成功！文件大小:', blob.size, 'bytes');
            // 在实际应用中，这里可以下载文件
        } else {
            const errorData = await response.json();
            console.error('❌ 转换失败:', errorData);
        }
    } catch (error) {
        console.error('❌ 请求错误:', error);
    }
}

// ============================================
// 示例4：批量转换（Node.js环境）
// ============================================
async function batchConvert() {
    console.log('📦 示例4：批量转换');
    
    const documents = [
        {
            name: 'physics-problem',
            html: '<p>物理题目：质量为m的物体，在重力<math xmlns="http://www.w3.org/1998/Math/MathML"><mi>g</mi></math>作用下的重力势能为：<math xmlns="http://www.w3.org/1998/Math/MathML"><mi>E</mi><mo>=</mo><mi>m</mi><mi>g</mi><mi>h</mi></math></p>'
        },
        {
            name: 'chemistry-equation',
            html: '<p>化学反应：<math xmlns="http://www.w3.org/1998/Math/MathML"><mmultiscripts><mi>H</mi><none/><mn>+</mn></mmultiscripts><mo>+</mo><mmultiscripts><mi>OH</mi><none/><mn>-</mn></mmultiscripts><mo>→</mo><mmultiscripts><mi>H</mi><mn>2</mn></mmultiscripts><mi>O</mi></math></p>'
        }
    ];

    for (const doc of documents) {
        try {
            console.log(`🔄 转换 ${doc.name}...`);
            
            const response = await fetch(`${API_BASE}/convert`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    html: doc.html,
                    filename: `${doc.name}.docx`
                })
            });

            if (response.ok) {
                console.log(`✅ ${doc.name} 转换成功！`);
            } else {
                console.error(`❌ ${doc.name} 转换失败`);
            }
        } catch (error) {
            console.error(`❌ ${doc.name} 请求错误:`, error);
        }
        
        // 避免请求过快
        await new Promise(resolve => setTimeout(resolve, 1000));
    }
}

// ============================================
// 示例5：使用curl命令（命令行调用）
// ============================================
function showCurlExamples() {
    console.log('💻 示例5：curl命令行调用');
    
    console.log(`
# 1. 健康检查
curl "${API_BASE}/health"

# 2. 转换HTML到DOCX
curl -X POST "${API_BASE}/convert" \\
  -H "Content-Type: application/json" \\
  -d '{
    "html": "<p>测试公式：<math xmlns=\\"http://www.w3.org/1998/Math/MathML\\"><mfrac><mi>a</mi><mi>b</mi></mfrac></math></p>",
    "filename": "test.docx"
  }' \\
  --output test.docx

# 3. 上传HTML文件转换
curl -X POST "${API_BASE}/convert/file" \\
  -F "htmlFile=@input.html" \\
  -F "filename=output.docx" \\
  --output output.docx
    `);
}

// ============================================
// 示例6：React组件中使用
// ============================================
function ReactExample() {
    console.log('⚛️ 示例6：React组件使用');
    
    return `
import React, { useState } from 'react';

function HtmlToDocxConverter() {
    const [html, setHtml] = useState('');
    const [loading, setLoading] = useState(false);

    const convertToDocx = async () => {
        setLoading(true);
        try {
            const response = await fetch('${API_BASE}/convert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    html: html,
                    filename: 'converted.docx'
                })
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'converted.docx';
                a.click();
                window.URL.revokeObjectURL(url);
            }
        } catch (error) {
            console.error('转换失败:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <textarea 
                value={html}
                onChange={(e) => setHtml(e.target.value)}
                placeholder="输入包含MathML的HTML内容..."
            />
            <button onClick={convertToDocx} disabled={loading}>
                {loading ? '转换中...' : '转换为DOCX'}
            </button>
        </div>
    );
}
    `;
}

// ============================================
// 运行所有示例
// ============================================
async function runAllExamples() {
    console.log('🚀 开始运行API示例...\n');
    
    // 1. 检查健康状态
    const isHealthy = await checkApiHealth();
    if (!isHealthy) {
        console.log('⚠️ API服务不健康，请检查部署状态');
        return;
    }
    
    console.log('\n');
    
    // 2. 转换数学公式
    await convertMathFormulas();
    
    console.log('\n');
    
    // 3. 显示其他示例
    showCurlExamples();
    console.log(ReactExample());
    
    console.log('\n✅ 所有示例运行完成！');
}

// 导出函数供外部使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        convertChemistryProblem,
        checkApiHealth,
        convertMathFormulas,
        batchConvert,
        runAllExamples
    };
}

// 如果在浏览器中直接运行
if (typeof window !== 'undefined') {
    window.HTML2DocxAPI = {
        convertChemistryProblem,
        checkApiHealth,
        convertMathFormulas,
        batchConvert,
        runAllExamples
    };
    
    console.log('🎯 API示例已加载！使用 HTML2DocxAPI.runAllExamples() 运行所有示例');
} 