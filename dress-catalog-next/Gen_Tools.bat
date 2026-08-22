@echo off
setlocal EnableExtensions

REM ================================================
REM If an option was supplied by another batch file,
REM use it directly. Otherwise show the menu.
REM ================================================

if "%~1"=="" goto menu

set "choice=%~1"
goto process_choice

:menu
cls
echo ================================================
echo       JAIN FANCY DRESSES - PROJECT TOOLS
echo ================================================
echo.
echo  1. Install dependencies
echo  2. Generate Prisma Client
echo  3. Deploy Prisma migrations
echo  4. Create Prisma migration
echo  5. Check Prisma migration status
echo  6. Build application
echo  7. Full build
echo  8. Full build Deploy
echo  9. Backup Neon/PostgreSQL + Cloudinary
echo 10. Export local catalog data
echo 11. Validate local changes
echo 12. Sync local changes
echo 13. Restore PostgreSQL database
echo 14. Restore Cloudinary images
echo 15. Restore EVERYTHING
echo 16. TypeScript check
echo 17. Exit
echo.
set /p "choice=Enter your choice (1-17): "



:process_choice
if "%choice%"=="1" goto install
if "%choice%"=="2" goto prisma_generate
if "%choice%"=="3" goto prisma_migrate
if "%choice%"=="4" goto prisma_migrate_dev
if "%choice%"=="5" goto prisma_status
if "%choice%"=="6" goto build
if "%choice%"=="7" goto full_build
if "%choice%"=="8" goto full_build_deploy
if "%choice%"=="9" goto backup
if "%choice%"=="10" goto export_data
if "%choice%"=="11" goto validate
if "%choice%"=="12" goto sync
if "%choice%"=="13" goto restore_db
if "%choice%"=="14" goto restore_cloudinary
if "%choice%"=="15" goto restore_all
if "%choice%"=="16" goto typecheck
if "%choice%"=="17" goto end

echo.
echo Invalid choice: %choice%
pause
goto menu


:install
cls
echo Installing dependencies...
call npm install
if errorlevel 1 goto failed
goto success

:prisma_generate
cls
echo Generating Prisma Client...
call npx prisma generate
if errorlevel 1 goto failed
goto success

:prisma_migrate
cls
echo Deploying Prisma migrations...
call npx prisma migrate deploy
if errorlevel 1 goto failed
goto success


:prisma_migrate_dev
cls
if "%~2"=="" (
  set /p "migration_name=Enter migration name: "
) else (
  set "migration_name=%~2"
)
if "%migration_name%"=="" goto cancelled
echo Creating Prisma migration: %migration_name%
call npx prisma migrate dev --name "%migration_name%"
if errorlevel 1 goto failed
goto success

:prisma_status
cls
echo Checking Prisma migration status...
call npx prisma migrate status
if errorlevel 1 goto failed
goto success

:build
cls
echo Building Next.js application...
call npm run build
if errorlevel 1 goto failed
goto success

:full_build
cls
echo Running full build...
call npm install
if errorlevel 1 goto failed
call npx prisma generate
if errorlevel 1 goto failed
call npx prisma migrate deploy
if errorlevel 1 goto failed
call npm run build
if errorlevel 1 goto failed
goto success

:full_build_deploy
cls
echo Running full build with deployment...
call npm install
if errorlevel 1 goto failed
call npx prisma generate
if errorlevel 1 goto failed
call npx prisma migrate deploy
if errorlevel 1 goto failed
call npm run build
if errorlevel 1 goto failed
call npm run dev
if errorlevel 1 goto failed
goto success

:backup
cls
echo Creating Neon/PostgreSQL + Cloudinary backup...
call npm run backup
if errorlevel 1 goto failed
goto success

:export_data
cls
echo Exporting local catalog data...
call npm run export:data
if errorlevel 1 goto failed
goto success

:validate
cls
echo Validating local changes...
call npm run validate:changes
if errorlevel 1 goto failed
goto success

:sync
cls
echo Syncing local changes...
call npm run sync
if errorlevel 1 goto failed
goto success

:restore_db
cls
echo WARNING: This will restore the PostgreSQL database.
set /p confirm=Type YES to continue: 
if /I not "%confirm%"=="YES" goto cancelled
set "CONFIRM_RESTORE=YES"
call npm run restore
set "CONFIRM_RESTORE="
if errorlevel 1 goto failed
goto success

:restore_cloudinary
cls
echo WARNING: This will restore Cloudinary assets.
set /p confirm=Type YES to continue: 
if /I not "%confirm%"=="YES" goto cancelled
set "CONFIRM_CLOUDINARY_RESTORE=YES"
call npm run restore:cloudinary
set "CONFIRM_CLOUDINARY_RESTORE="
if errorlevel 1 goto failed
goto success

:restore_all
cls
echo WARNING: This will restore BOTH Cloudinary and PostgreSQL.
echo This is the most destructive operation in this menu.
set /p confirm=Type RESTORE-ALL to continue: 
if /I not "%confirm%"=="RESTORE-ALL" goto cancelled
set "CONFIRM_RESTORE_ALL=YES"
call npm run restore:all
set "CONFIRM_RESTORE_ALL="
if errorlevel 1 goto failed
goto success

:typecheck
cls
echo Running TypeScript check...
call npx tsc --noEmit
if errorlevel 1 goto failed
goto success

:cancelled
echo.
echo Operation cancelled.
pause
goto menu

:success
echo.
echo ================================================
echo Command completed successfully.
echo ================================================
pause
goto menu

:failed
echo.
echo ================================================
echo COMMAND FAILED
echo ================================================
echo Review the error messages above.
pause
goto menu

:end
echo Goodbye.
endlocal
exit /b 0
