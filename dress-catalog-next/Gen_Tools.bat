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
echo  4. Build application
echo  5. Full build
echo  6. Full build with deployment
echo  7. Backup Neon/PostgreSQL + Cloudinary
echo  8. Export local catalog data
echo  9. Validate local changes
echo  10. Sync local changes
echo 11. Restore PostgreSQL database
echo 12. Restore Cloudinary images
echo 13. Restore EVERYTHING
echo 14. TypeScript check
echo 15. Exit
echo.
set /p "choice=Enter your choice (1-16): "


:process_choice
if "%choice%"=="1" goto install
if "%choice%"=="2" goto prisma_generate
if "%choice%"=="3" goto prisma_migrate
if "%choice%"=="4" goto build
if "%choice%"=="5" goto full_build
if "%choice%"=="6" goto full_build_deploy
if "%choice%"=="7" goto backup
if "%choice%"=="8" goto export_data
if "%choice%"=="9" goto validate
if "%choice%"=="10" goto sync
if "%choice%"=="11" goto restore_db
if "%choice%"=="12" goto restore_cloudinary
if "%choice%"=="13" goto restore_all
if "%choice%"=="14" goto typecheck
if "%choice%"=="15" goto end

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
