$root = "C:\Users\ArtūrasRadzevičiusEu\OneDrive - Eudara, UAB\Desktop\Ebresa website"
$outDir = Join-Path $root "standalone"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $outDir "en") | Out-Null
New-Item -ItemType Directory -Force -Path (Join-Path $outDir "pl") | Out-Null

$css = Get-Content (Join-Path $root "css\style.css") -Raw -Encoding UTF8
$js = Get-Content (Join-Path $root "js\main.js") -Raw -Encoding UTF8
$faviconSvg = Get-Content (Join-Path $root "favicon.svg") -Raw -Encoding UTF8
$faviconB64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($faviconSvg))
$faviconDataUri = "data:image/svg+xml;base64,$faviconB64"

function Get-MimeType($ext) {
  switch ($ext.ToLower()) {
    ".jpg"  { return "image/jpeg" }
    ".jpeg" { return "image/jpeg" }
    ".png"  { return "image/png" }
    ".svg"  { return "image/svg+xml" }
    default { return "application/octet-stream" }
  }
}

# Pre-load every image in /images as a base64 data URI, keyed by filename
$imageDir = Join-Path $root "images"
$imageMap = @{}
Get-ChildItem $imageDir -File | ForEach-Object {
  $bytes = [IO.File]::ReadAllBytes($_.FullName)
  $b64 = [Convert]::ToBase64String($bytes)
  $mime = Get-MimeType $_.Extension
  $imageMap[$_.Name] = "data:$mime;base64,$b64"
}

# Relative paths for every page across all three languages. Sub-folder pages
# use "../" for shared assets (css/js/images/favicon) but plain filenames for
# same-language sibling pages — both patterns are handled below regardless of depth.
$pages = @(
  "index.html", "privatumo-politika.html", "slapuku-politika.html",
  "en\index.html", "en\privacy-policy.html", "en\cookie-policy.html",
  "pl\index.html", "pl\polityka-prywatnosci.html", "pl\polityka-plikow-cookie.html"
)

foreach ($page in $pages) {
  $html = Get-Content (Join-Path $root $page) -Raw -Encoding UTF8

  # Inline stylesheet (root pages: css/style.css, sub-folder pages: ../css/style.css)
  $html = $html -replace '<link rel="stylesheet" href="(\.\./)?css/style\.css">', "<style>`n$css`n</style>"

  # Inline script
  $html = $html -replace '<script src="(\.\./)?js/main\.js"></script>', "<script>`n$js`n</script>"

  # Inline favicon
  $html = $html -replace 'href="(\.\./)?favicon\.svg" type="image/svg\+xml"', "href=`"$faviconDataUri`" type=`"image/svg+xml`""

  # Inline every images/xxx or ../images/xxx reference
  foreach ($name in $imageMap.Keys) {
    $dataUri = $imageMap[$name]
    $html = $html -replace ('(\.\./)?' + [Regex]::Escape("images/$name")), $dataUri
  }

  $outPath = Join-Path $outDir $page
  [IO.File]::WriteAllText($outPath, $html, [Text.UTF8Encoding]::new($false))
  $sizeKB = [Math]::Round((Get-Item $outPath).Length / 1KB, 0)
  Write-Output "$page -> standalone\$page ($sizeKB KB)"
}
