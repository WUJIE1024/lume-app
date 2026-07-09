Add-Type -AssemblyName System.Drawing

$iconDir = "d:\Trae_hackathon\lume-app\src\static\icons"
New-Item -ItemType Directory -Force -Path $iconDir | Out-Null

$size = 81

function New-IconPng($path, $bgHex, $glyph) {
  $bmp = New-Object System.Drawing.Bitmap $size, $size
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = "AntiAlias"
  $g.InterpolationMode = "HighQualityBicubic"
  $g.TextRenderingHint = "AntiAliasGridFit"
  $g.Clear([System.Drawing.Color]::Transparent)

  $brush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml($bgHex))
  $g.FillEllipse($brush, 4, 4, $size - 8, $size - 8)
  $brush.Dispose()

  $font = New-Object System.Drawing.Font "Segoe UI Symbol", 36, ([System.Drawing.FontStyle]::Bold)
  $textBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = "Center"
  $sf.LineAlignment = "Center"
  $rect = New-Object System.Drawing.RectangleF 0, 0, $size, $size
  $g.DrawString($glyph, $font, $textBrush, $rect, $sf)
  $font.Dispose()
  $textBrush.Dispose()
  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

$glyphs = [char[]]@([char]0x2302, [char]0x2714, [char]0x25C6, [char]0x2665, [char]0x263A)
$names = @("home", "test", "plan", "chat", "user")

for ($i = 0; $i -lt $names.Length; $i++) {
  $name = $names[$i]
  $g = $glyphs[$i]
  New-IconPng "$iconDir\$name.png" "#999999" $g
  New-IconPng "$iconDir\$name-active.png" "#FF6B8A" $g
}

Get-ChildItem $iconDir | Format-Table Name, Length
