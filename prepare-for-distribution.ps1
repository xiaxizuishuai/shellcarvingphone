# 准备项目分发脚本
# 用途：移除敏感文件，准备安全分发

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  项目安全分发准备脚本" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 检查当前目录
if (-not (Test-Path "config.js.example")) {
    Write-Host "错误：未找到 config.js.example" -ForegroundColor Red
    Write-Host "请确保在项目根目录运行此脚本" -ForegroundColor Yellow
    exit 1
}

# 备份 config.js（如果存在）
if (Test-Path "config.js") {
    Write-Host "发现 config.js，正在备份..." -ForegroundColor Yellow
    $backupName = "config.js.backup.$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    Copy-Item "config.js" $backupName
    Write-Host "✓ 已备份到: $backupName" -ForegroundColor Green
    
    Remove-Item "config.js"
    Write-Host "✓ config.js 已移除" -ForegroundColor Green
} else {
    Write-Host "✓ config.js 不存在（已安全）" -ForegroundColor Green
}

# 检查其他敏感文件
$sensitiveFiles = @(
    ".env",
    ".env.local",
    "secrets.json",
    "credentials.json"
)

$foundSensitive = $false
foreach ($file in $sensitiveFiles) {
    if (Test-Path $file) {
        Write-Host "警告：发现敏感文件 $file" -ForegroundColor Yellow
        $foundSensitive = $true
    }
}

if ($foundSensitive) {
    Write-Host ""
    Write-Host "请手动检查并处理上述敏感文件" -ForegroundColor Yellow
}

# 检查必要文件是否存在
Write-Host ""
Write-Host "检查必要文件..." -ForegroundColor Cyan
$requiredFiles = @(
    "config.js.example",
    "README_API_CONFIG.md",
    "API_INTEGRATION_GUIDE.md"
)

$allPresent = $true
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "  ✓ $file" -ForegroundColor Green
    } else {
        Write-Host "  ✗ $file (缺失)" -ForegroundColor Red
        $allPresent = $false
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
if ($allPresent) {
    Write-Host "✓ 准备完成！可以安全地分享项目文件夹了" -ForegroundColor Green
} else {
    Write-Host "⚠ 部分必要文件缺失，请检查" -ForegroundColor Yellow
}
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "重要提示：" -ForegroundColor Yellow
Write-Host "1. 接收方需要复制 config.js.example 为 config.js" -ForegroundColor White
Write-Host "2. 接收方需要填入自己的 API Key" -ForegroundColor White
Write-Host "3. 参考 README_API_CONFIG.md 了解配置步骤" -ForegroundColor White
Write-Host ""

# 询问是否创建 ZIP
$createZip = Read-Host "是否创建 ZIP 分发包？(Y/N)"
if ($createZip -eq "Y" -or $createZip -eq "y") {
    $zipName = "贝漾涌起-安全版-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
    
    Write-Host "正在创建 ZIP 包..." -ForegroundColor Cyan
    
    # 排除的文件和文件夹
    $excludePatterns = @(
        "config.js",
        "config.js.backup*",
        ".git",
        "node_modules",
        "*.backup",
        ".DS_Store",
        "Thumbs.db"
    )
    
    # 获取所有文件，排除敏感文件
    $filesToZip = Get-ChildItem -Path . -Recurse | Where-Object {
        $shouldExclude = $false
        foreach ($pattern in $excludePatterns) {
            if ($_.FullName -like "*\$pattern*" -or $_.Name -like $pattern) {
                $shouldExclude = $true
                break
            }
        }
        return -not $shouldExclude
    }
    
    # 创建临时目录
    $tempDir = "temp_dist_$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    New-Item -ItemType Directory -Path $tempDir | Out-Null
    
    # 复制文件到临时目录
    foreach ($file in $filesToZip) {
        $relativePath = $file.FullName.Substring((Get-Location).Path.Length + 1)
        $destPath = Join-Path $tempDir $relativePath
        $destDir = Split-Path $destPath -Parent
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Copy-Item $file.FullName $destPath -Force
    }
    
    # 创建 ZIP
    Compress-Archive -Path "$tempDir\*" -DestinationPath $zipName -Force
    
    # 清理临时目录
    Remove-Item -Path $tempDir -Recurse -Force
    
    Write-Host "✓ ZIP 包已创建: $zipName" -ForegroundColor Green
}

Write-Host ""
Write-Host "完成！" -ForegroundColor Green

