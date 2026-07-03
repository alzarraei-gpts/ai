param(
  [string]$ProjectPath = (Get-Location).Path
)

$ErrorActionPreference = "Stop"

function Write-Step($msg) { Write-Host "[AI Patch] $msg" -ForegroundColor Cyan }
function Write-Ok($msg) { Write-Host "[OK] $msg" -ForegroundColor Green }
function Write-WarnMsg($msg) { Write-Host "[WARN] $msg" -ForegroundColor Yellow }

$root = (Resolve-Path $ProjectPath).Path
$indexPath = Join-Path $root "index.html"
$assetsPath = Join-Path $PSScriptRoot "assets"
$imagesPath = Join-Path $root "images"

if (-not (Test-Path $indexPath)) {
  throw "لم أجد index.html داخل المسار: $root"
}
if (-not (Test-Path $assetsPath)) {
  throw "لم أجد مجلد assets بجانب ملف السكربت. أبقِ بنية الحزمة كما هي."
}

Write-Step "المسار المستهدف: $root"
Write-Step "لن يتم تعديل admin.html أو لوحة التحكم."

if (-not (Test-Path $imagesPath)) {
  New-Item -ItemType Directory -Path $imagesPath | Out-Null
  Write-Ok "تم إنشاء مجلد images"
}

Copy-Item (Join-Path $assetsPath "logo.png") (Join-Path $imagesPath "logo.png") -Force
Copy-Item (Join-Path $assetsPath "whatsapp-preview.png") (Join-Path $imagesPath "whatsapp-preview.png") -Force
Copy-Item (Join-Path $assetsPath "favicon.png") (Join-Path $imagesPath "favicon.png") -Force
Write-Ok "تم نسخ logo.png و whatsapp-preview.png و favicon.png إلى images"

$backupDir = Join-Path $root "_backup_before_logo_patch"
if (-not (Test-Path $backupDir)) {
  New-Item -ItemType Directory -Path $backupDir | Out-Null
}
$stamp = Get-Date -Format "yyyyMMdd-HHmmss"
Copy-Item $indexPath (Join-Path $backupDir "index.html.$stamp.bak") -Force
Write-Ok "تم حفظ نسخة احتياطية من index.html"

$html = Get-Content $indexPath -Raw -Encoding UTF8

# Remove old patch blocks if the script is re-run.
$html = [regex]::Replace($html, "(?s)\s*<!-- BEGIN AI LOGO OG PATCH -->.*?<!-- END AI LOGO OG PATCH -->", "")
$html = [regex]::Replace($html, "(?s)\s*<!-- BEGIN AI LOGO HEADER PATCH -->.*?<!-- END AI LOGO HEADER PATCH -->", "")

$headPatch = @'
<!-- BEGIN AI LOGO OG PATCH -->
<link rel="icon" type="image/png" href="images/favicon.png" />
<link rel="apple-touch-icon" href="images/favicon.png" />
<meta property="og:type" content="website" />
<meta property="og:title" content="النماذج العربية الذكية" />
<meta property="og:description" content="منصة مختصرة لعرض نماذج الذكاء الاصطناعي العربية." />
<meta property="og:url" content="https://alzarraei-gpts.github.io/ai/" />
<meta property="og:image" content="https://alzarraei-gpts.github.io/ai/images/whatsapp-preview.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="شعار النماذج العربية الذكية" />
<meta property="og:locale" content="ar_AR" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="النماذج العربية الذكية" />
<meta name="twitter:description" content="منصة مختصرة لعرض نماذج الذكاء الاصطناعي العربية." />
<meta name="twitter:image" content="https://alzarraei-gpts.github.io/ai/images/whatsapp-preview.png" />
<!-- END AI LOGO OG PATCH -->
'@

$headerPatch = @'
<!-- BEGIN AI LOGO HEADER PATCH -->
<style>
  .ai-brand-heading-wrap {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: clamp(10px, 2vw, 16px);
    direction: rtl;
    max-width: 100%;
    vertical-align: middle;
  }
  .ai-brand-heading-wrap > h1 {
    margin-top: 0;
    margin-bottom: 0;
  }
  .ai-brand-logo-inline {
    width: clamp(48px, 7vw, 76px);
    height: clamp(48px, 7vw, 76px);
    object-fit: contain;
    display: block;
    flex: 0 0 auto;
  }
  @media (max-width: 640px) {
    .ai-brand-heading-wrap {
      gap: 10px;
      align-items: center;
    }
    .ai-brand-logo-inline {
      width: 48px;
      height: 48px;
    }
  }
</style>
<script>
  (function () {
    function insertBrandLogo() {
      if (document.querySelector('[data-ai-brand-logo="true"]')) return;
      var title = document.querySelector('header h1, .hero h1, .hero-title, h1');
      if (!title || !title.parentNode) return;
      var wrapper = document.createElement('span');
      wrapper.className = 'ai-brand-heading-wrap';
      wrapper.setAttribute('data-ai-brand-wrap', 'true');
      var logo = document.createElement('img');
      logo.src = 'images/logo.png';
      logo.alt = 'شعار النماذج العربية الذكية';
      logo.className = 'ai-brand-logo-inline';
      logo.loading = 'eager';
      logo.decoding = 'async';
      logo.setAttribute('data-ai-brand-logo', 'true');
      title.parentNode.insertBefore(wrapper, title);
      wrapper.appendChild(logo);
      wrapper.appendChild(title);
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', insertBrandLogo, { once: true });
    } else {
      insertBrandLogo();
    }
  })();
</script>
<!-- END AI LOGO HEADER PATCH -->
'@

if ($html -match "</head>") {
  $html = $html -replace "</head>", ($headPatch + "`r`n" + $headerPatch + "`r`n</head>")
} else {
  throw "ملف index.html لا يحتوي على </head>. راجع بنية الملف أولًا."
}

Set-Content -Path $indexPath -Value $html -Encoding UTF8
Write-Ok "تم دمج وسوم المشاركة والشعار في index.html فقط."
Write-WarnMsg "لم يتم تعديل admin.html إطلاقًا."
Write-Host ""
Write-Host "الخطوة التالية في GitHub Desktop: Commit to main ثم Push origin" -ForegroundColor White
