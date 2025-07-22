@echo off
chcp 65001
echo ========================================
echo     HTML2DOCX API 服务安装脚本
echo ========================================
echo.

echo 🔍 检查环境...

:: 检查Node.js
echo 检查 Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到 Node.js
    echo 💡 请先安装 Node.js: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js 已安装
    node --version
)

:: 检查npm
echo 检查 npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ 未检测到 npm
    pause
    exit /b 1
) else (
    echo ✅ npm 已安装
    npm --version
)

:: 检查Pandoc
echo 检查 Pandoc...
pandoc --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  未检测到 Pandoc
    echo 💡 Pandoc是必需的依赖，请先安装:
    echo    下载地址: https://pandoc.org/installing.html
    echo    选择 Windows 版本下载 .msi 安装包
    echo.
    set /p install_pandoc="是否现在打开下载页面? (y/n): "
    if /i "%install_pandoc%"=="y" (
        start https://pandoc.org/installing.html
    )
    echo.
    echo 安装Pandoc后请重新运行此脚本
    pause
    exit /b 1
) else (
    echo ✅ Pandoc 已安装
    pandoc --version | findstr "pandoc"
)

echo.
echo 🚀 开始安装依赖...
echo.

:: 安装npm依赖
npm install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo.
echo 🎉 安装完成！
echo.
echo 📋 使用说明:
echo    启动服务: npm start
echo    开发模式: npm run dev
echo    运行测试: npm test
echo.
echo 🌐 服务将运行在: http://localhost:3000
echo 📖 详细文档请查看 README.md
echo.

set /p start_service="是否现在启动服务? (y/n): "
if /i "%start_service%"=="y" (
    echo 启动服务...
    npm start
) else (
    echo.
    echo 💡 当您准备好后，请运行: npm start
)

pause 