# Setup script for Fenix Platform database
$PSQL = "C:\Program Files\PostgreSQL\16\bin\psql.exe"

Write-Host "Creating database fenix_platform..." -ForegroundColor Green

# Create database
& $PSQL -U postgres -p 5433 -c "CREATE DATABASE fenix_platform;"

if ($LASTEXITCODE -eq 0) {
    Write-Host "Database created successfully!" -ForegroundColor Green
    
    Write-Host "Running schema migration..." -ForegroundColor Green
    
    # Run schema
    & $PSQL -U postgres -p 5433 -d fenix_platform -f "database/schema.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Schema migration completed!" -ForegroundColor Green
        Write-Host "Setup complete! You can now run: npm run dev" -ForegroundColor Cyan
    } else {
        Write-Host "Schema migration failed" -ForegroundColor Red
    }
} else {
    Write-Host "Database creation failed (it may already exist)" -ForegroundColor Yellow
    Write-Host "Trying to run schema anyway..." -ForegroundColor Yellow
    
    & $PSQL -U postgres -p 5433 -d fenix_platform -f "database/schema.sql"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Schema migration completed!" -ForegroundColor Green
    }
}
