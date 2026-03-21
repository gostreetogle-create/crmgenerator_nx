param(
  [string]$ApiBaseUrl = "http://localhost:3000/api",
  [string]$ProductId = ""
)

$ErrorActionPreference = "Stop"

function Get-FirstProductId {
  param([string]$BaseUrl)
  $products = Invoke-RestMethod -Uri "$BaseUrl/products" -Method Get
  if (-not $products -or $products.Count -eq 0) {
    throw "No products available. Pass -ProductId explicitly or seed products."
  }
  return $products[0]._id
}

if (-not $ProductId) {
  $ProductId = Get-FirstProductId -BaseUrl $ApiBaseUrl
}

Write-Output "Using ProductId: $ProductId"

$before = Invoke-RestMethod -Uri "$ApiBaseUrl/products/$ProductId/specifications" -Method Get
Write-Output "Before count: $($before.Count)"

$createBody = @{
  partTypeId = "pt1"
  materialId = "mat1"
  displayName = "Smoke Spec"
  isActive = $true
} | ConvertTo-Json

$created = Invoke-RestMethod `
  -Uri "$ApiBaseUrl/products/$ProductId/specifications" `
  -Method Post `
  -ContentType "application/json" `
  -Body $createBody

Write-Output "Created: $($created._id)"

$patchBody = @{
  displayName = "Smoke Spec Updated"
} | ConvertTo-Json

$updated = Invoke-RestMethod `
  -Uri "$ApiBaseUrl/products/$ProductId/specifications/$($created._id)" `
  -Method Patch `
  -ContentType "application/json" `
  -Body $patchBody

Write-Output "Updated displayName: $($updated.displayName)"

Invoke-RestMethod `
  -Uri "$ApiBaseUrl/products/$ProductId/specifications/$($created._id)" `
  -Method Delete | Out-Null

$after = Invoke-RestMethod -Uri "$ApiBaseUrl/products/$ProductId/specifications" -Method Get
Write-Output "After count: $($after.Count)"

Write-Output "Smoke test passed."
