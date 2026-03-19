# Add system_settings table to database
$env:PGPASSWORD = "donthesitate1010"

Write-Host "Adding system_settings table..." -ForegroundColor Cyan

# Run the migration
& "C:\Program Files\PostgreSQL\17\bin\psql.exe" -U postgres -d fenix_platform -p 5433 -f "backend/database/add_system_settings.sql"

if ($LASTEXITCODE -eq 0) {
    Write-Host "System settings table added successfully!" -ForegroundColor Green
} else {
    Write-Host "Failed to add system settings table" -ForegroundColor Red
    exit 1
}
