const cheerio = require('cheerio');
const { mathml2latex } = require('mathml-to-latex');

class HTMLProcessor {
  
  // 主要的HTML处理函数
  async processHtml(html) {
    try {
      console.log('开始处理HTML，优化MathML格式...');
      
      // 使用cheerio解析HTML
      const $ = cheerio.load(html, {
        decodeEntities: false,
        xmlMode: false
      });
      
      // 添加中文字体样式
      this.addChineseFontStyle($);
      
      // 修复mmultiscripts问题
      this.fixMmultiscripts($);
      
      // 保持其他MathML不变，只进行基本清理
      this.cleanHtml($);
      
      const processedHtml = $.html();
      console.log('HTML处理完成，MathML已优化，已设置宋体字体');
      
      return processedHtml;
    } catch (error) {
      console.error('HTML处理错误:', error);
      throw error;
    }
  }
  
  // 处理MathML元素
  async processMathMLElements($) {
    const mathElements = $('math');
    console.log(`发现 ${mathElements.length} 个MathML元素`);
    
    mathElements.each((index, element) => {
      try {
        const $math = $(element);
        const mathmlString = $.html($math);
        
        console.log(`处理第 ${index + 1} 个MathML元素...`);
        
        // 转换MathML为LaTeX
        let latex = this.mathmlToLatex(mathmlString);
        
        if (latex) {
          // 确保LaTeX被正确包装为行内或行间公式
          if (!latex.startsWith('$') && !latex.startsWith('\\[')) {
            // 判断是否应该是行间公式
            const isDisplayMath = $math.attr('display') === 'block' || 
                                 $math.parent().is('p') && $math.parent().children().length === 1;
            
            if (isDisplayMath) {
              latex = `$$${latex}$$`;
            } else {
              latex = `$${latex}$`;
            }
          }
          
          // 替换MathML元素为LaTeX
          $math.replaceWith(latex);
          console.log(`第 ${index + 1} 个公式转换成功`);
        } else {
          console.warn(`第 ${index + 1} 个公式转换失败，保持原样`);
        }
      } catch (error) {
        console.error(`处理第 ${index + 1} 个MathML元素时出错:`, error);
      }
    });
  }
  
  // MathML转LaTeX的核心函数
  mathmlToLatex(mathmlString) {
    try {
      // 清理MathML字符串
      let cleanMathml = mathmlString
        .replace(/xmlns="[^"]*"/g, '') // 移除命名空间
        .replace(/\s+/g, ' ') // 标准化空格
        .trim();
      
      // 手动处理一些常见的MathML结构
      cleanMathml = this.preprocessMathML(cleanMathml);
      
      // 使用mathml-to-latex库转换
      const latex = mathml2latex(cleanMathml);
      
      if (latex && latex.trim()) {
        return this.postprocessLatex(latex);
      }
      
      // 如果自动转换失败，尝试手动解析
      return this.manualMathMLParse(cleanMathml);
      
    } catch (error) {
      console.error('MathML转LaTeX错误:', error);
      
      // 如果所有方法都失败，尝试手动解析
      try {
        return this.manualMathMLParse(mathmlString);
      } catch (manualError) {
        console.error('手动解析也失败:', manualError);
        return null;
      }
    }
  }
  
  // 预处理MathML
  preprocessMathML(mathml) {
    return mathml
      // 处理上下标符号
      .replace(/<mmultiscripts>/g, '<msub>')
      .replace(/<\/mmultiscripts>/g, '</msub>')
      .replace(/<mprescripts\s*\/>/g, '')
      // 标准化分数
      .replace(/<mfrac>/g, '<mfrac>')
      .replace(/<\/mfrac>/g, '</mfrac>');
  }
  
  // 后处理LaTeX
  postprocessLatex(latex) {
    return latex
      .replace(/\\\\/g, '\\') // 修复双反斜杠
      .replace(/\s+/g, ' ') // 标准化空格
      .trim();
  }
  
  // 手动解析MathML（作为备用方案）
  manualMathMLParse(mathml) {
    try {
      const $ = cheerio.load(mathml, { xmlMode: true });
      return this.parseNode($('math').first(), $);
    } catch (error) {
      console.error('手动解析MathML失败:', error);
      return null;
    }
  }
  
  // 递归解析MathML节点
  parseNode(node, $) {
    const tagName = node.get(0)?.tagName?.toLowerCase();
    
    switch (tagName) {
      case 'math':
        return this.parseChildren(node, $);
        
      case 'mi': // 标识符
        return node.text();
        
      case 'mn': // 数字
        return node.text();
        
      case 'mo': // 操作符
        const op = node.text();
        if (op === '×') return '\\times';
        if (op === '÷') return '\\div';
        return op;
        
      case 'mfrac': // 分数
        const children = node.children();
        if (children.length >= 2) {
          const numerator = this.parseNode($(children[0]), $);
          const denominator = this.parseNode($(children[1]), $);
          return `\\frac{${numerator}}{${denominator}}`;
        }
        break;
        
      case 'msup': // 上标
        const supChildren = node.children();
        if (supChildren.length >= 2) {
          const base = this.parseNode($(supChildren[0]), $);
          const superscript = this.parseNode($(supChildren[1]), $);
          return `${base}^{${superscript}}`;
        }
        break;
        
      case 'msub': // 下标
        const subChildren = node.children();
        if (subChildren.length >= 2) {
          const base = this.parseNode($(subChildren[0]), $);
          const subscript = this.parseNode($(subChildren[1]), $);
          return `${base}_{${subscript}}`;
        }
        break;
        
      case 'mmultiscripts': // 多重上下标
        return this.parseMultiscripts(node, $);
        
      case 'mrow': // 行
        return this.parseChildren(node, $);
        
      case 'mtext': // 文本
        return `\\text{${node.text()}}`;
        
      default:
        return this.parseChildren(node, $);
    }
    
    return '';
  }
  
  // 解析多重上下标
  parseMultiscripts(node, $) {
    const children = node.children();
    if (children.length < 1) return '';
    
    let result = this.parseNode($(children[0]), $); // 基础元素
    let index = 1;
    
    // 处理前置脚本（如原子序数）
    const mprescripts = node.find('mprescripts');
    if (mprescripts.length > 0) {
      // 找到mprescripts的位置
      const prescriptsIndex = children.index(mprescripts[0]);
      if (prescriptsIndex > 0 && prescriptsIndex + 1 < children.length) {
        const prescriptNumber = this.parseNode($(children[prescriptsIndex + 1]), $);
        result = `{}^{${prescriptNumber}}${result}`;
      }
    }
    
    return result;
  }
  
  // 解析子节点
  parseChildren(node, $) {
    let result = '';
    node.children().each((i, child) => {
      if (child.tagName !== 'mprescripts') {
        result += this.parseNode($(child), $);
      }
    });
    return result;
  }
  
  // 修复mmultiscripts显示问题
  fixMmultiscripts($) {
    $('mmultiscripts').each((index, element) => {
      try {
        const $multiscripts = $(element);
        const children = $multiscripts.children();
        
        if (children.length >= 2) {
          const baseElement = $(children[0]); // 基础元素（如C、X）
          const prescriptsIndex = children.index($multiscripts.find('mprescripts')[0]);
          
          if (prescriptsIndex >= 0 && prescriptsIndex + 1 < children.length) {
            // 有前置脚本（如原子序数）
            const prescriptNumber = $(children[prescriptsIndex + 1]);
            
            // 创建新的上标结构：{}^{12}C
            const newStructure = `
              <mrow>
                <msup>
                  <mrow></mrow>
                  <mn>${prescriptNumber.text()}</mn>
                </msup>
                <mi>${baseElement.text()}</mi>
              </mrow>
            `;
            
            $multiscripts.replaceWith(newStructure);
            console.log(`修复了第 ${index + 1} 个mmultiscripts元素: ${baseElement.text()}`);
          } else {
            // 没有前置脚本，可能是后置上标
            if (children.length >= 3) {
              const subscript = $(children[1]);
              const superscript = $(children[2]);
              
              const newStructure = `
                <msubsup>
                  <mi>${baseElement.text()}</mi>
                  <mn>${subscript.text()}</mn>
                  <mn>${superscript.text()}</mn>
                </msubsup>
              `;
              
              $multiscripts.replaceWith(newStructure);
              console.log(`修复了第 ${index + 1} 个mmultiscripts元素（上下标）: ${baseElement.text()}`);
            } else {
              // 简单的上标
              const superscript = $(children[1]);
              const newStructure = `
                <msup>
                  <mi>${baseElement.text()}</mi>
                  <mn>${superscript.text()}</mn>
                </msup>
              `;
              
              $multiscripts.replaceWith(newStructure);
              console.log(`修复了第 ${index + 1} 个mmultiscripts元素（上标）: ${baseElement.text()}`);
            }
          }
        }
      } catch (error) {
        console.error(`处理第 ${index + 1} 个mmultiscripts元素时出错:`, error);
      }
    });
  }
  
  // 添加中文字体样式
  addChineseFontStyle($) {
    // 检查是否已有head标签
    if ($('head').length === 0) {
      // 如果没有head标签，创建完整的HTML结构
      const bodyContent = $.html();
      const fullHtml = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <style>
        body, p, div, span, h1, h2, h3, h4, h5, h6, li, td, th {
            font-family: "SimSun", "宋体", "Times New Roman", serif !important;
            font-size: 12pt;
            line-height: 1.5;
        }
        
        /* 确保数学公式也使用合适的字体 */
        math, mtext {
            font-family: "SimSun", "宋体", "Times New Roman", serif !important;
        }
        
        /* 强调文本样式 */
        strong, b {
            font-weight: bold;
            font-family: "SimSun", "宋体", "Times New Roman", serif !important;
        }
        
        /* 段落间距 */
        p {
            margin: 6pt 0;
            text-align: justify;
        }
    </style>
</head>
<body>
${bodyContent}
</body>
</html>`;
      
      // 重新解析完整的HTML
      const newDoc = cheerio.load(fullHtml, {
        decodeEntities: false,
        xmlMode: false
      });
      
      // 替换当前的$对象
      Object.setPrototypeOf($, newDoc);
      Object.assign($, newDoc);
    } else {
      // 如果已有head标签，只添加样式
      const style = `
        <style>
            body, p, div, span, h1, h2, h3, h4, h5, h6, li, td, th {
                font-family: "SimSun", "宋体", "Times New Roman", serif !important;
                font-size: 12pt;
                line-height: 1.5;
            }
            
            math, mtext {
                font-family: "SimSun", "宋体", "Times New Roman", serif !important;
            }
            
            strong, b {
                font-weight: bold;
                font-family: "SimSun", "宋体", "Times New Roman", serif !important;
            }
            
            p {
                margin: 6pt 0;
                text-align: justify;
            }
        </style>
      `;
      $('head').append(style);
    }
  }
  
  // 清理HTML结构
  cleanHtml($) {
    // 移除空的段落
    $('p').each((i, el) => {
      const $p = $(el);
      if ($p.text().trim() === '' && $p.children().length === 0) {
        $p.remove();
      }
    });
    
    // 标准化空格
    $('*').contents().filter(function() {
      return this.type === 'text';
    }).each(function() {
      this.data = this.data.replace(/\s+/g, ' ');
    });
  }
}

module.exports = new HTMLProcessor(); 