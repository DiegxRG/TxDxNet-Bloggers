$ErrorActionPreference = 'Stop'

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$environmentPath = Join-Path $projectRoot '.env.local'
$projectRef = 'qfwekssxqjweujyijyyo'
$poolerHost = 'aws-0-ca-central-1.pooler.supabase.com'

if (Test-Path -LiteralPath $environmentPath) {
  throw '.env.local ya existe. No se sobrescribió para proteger sus secretos.'
}

Write-Host 'Configuración local de TxDxNet + Supabase'
Write-Host 'La contraseña no se mostrará ni se enviará fuera de este equipo.'
$securePassword = Read-Host 'Contraseña de la base de datos de Supabase' -AsSecureString

$passwordPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
try {
  $plainPassword = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($passwordPointer)
  if ([string]::IsNullOrWhiteSpace($plainPassword)) {
    throw 'La contraseña no puede estar vacía.'
  }

  $encodedPassword = [Uri]::EscapeDataString($plainPassword)
}
finally {
  [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($passwordPointer)
  $plainPassword = $null
}

$secretBytes = New-Object byte[] 48
$randomGenerator = [Security.Cryptography.RandomNumberGenerator]::Create()
try {
  $randomGenerator.GetBytes($secretBytes)
  $payloadSecret = [Convert]::ToBase64String($secretBytes)
}
finally {
  $randomGenerator.Dispose()
}

$environment = @"
NEXT_PUBLIC_SITE_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres.${projectRef}:${encodedPassword}@${poolerHost}:5432/postgres?uselibpqcompat=true&sslmode=require
PAYLOAD_SECRET=${payloadSecret}
PAYLOAD_DB_PUSH=true

S3_BUCKET=media
S3_ENDPOINT=https://${projectRef}.storage.supabase.co/storage/v1/s3
S3_REGION=ca-central-1
S3_ACCESS_KEY_ID=
S3_SECRET_ACCESS_KEY=
"@

Set-Content -LiteralPath $environmentPath -Value $environment -Encoding UTF8

Write-Host ''
Write-Host '.env.local creado correctamente.' -ForegroundColor Green
Write-Host 'Ahora ejecuta: npm run dev'
Write-Host 'Después abre: http://localhost:3000/admin'
