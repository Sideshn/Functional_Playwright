@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
set NO_COLOR=1
set FORCE_COLOR=0
set NODE_OPTIONS=--no-warnings
set PW_TEST_HTML_REPORT_OPEN=never
REM ============================================================================
REM Playwright Test Execution - Parallel with Consolidated Report
REM Description: Runs all specs in parallel, generates one consolidated HTML report
REM Report saved to TestReports\playwright-report-parallel_<timestamp>
REM ============================================================================

echo.
echo ============================================================================
echo   PLAYWRIGHT PARALLEL TEST EXECUTION
echo ============================================================================
echo.

REM Set variables
set BROWSER=chromium
set WORKERS=2
set PROJECT_DIR=%~dp0

REM ============================================================================
REM SCALABLE TEST LIST - Add test names here (without .spec.js)
REM Format: FolderName/TestFileName
REM ============================================================================
set TEST_LIST=
REM Signup/Login Tests
set TEST_LIST=%TEST_LIST%;SignupLogin/SignupAndLoginCreationVerificationUpdated
set TEST_LIST=%TEST_LIST%;SignupLogin/SignupAndLoginCreationVerificationUpdatedDataValuesFromExcel
REM Product Tests
set TEST_LIST=%TEST_LIST%;Product/ProductTests
REM Contact Us Tests
set TEST_LIST=%TEST_LIST%;ContactUs/ContactUsFormSubmission
REM Home Page Tests
set TEST_LIST=%TEST_LIST%;HomePage/VerifySubscriptionInHomePage
REM Cart Tests
set TEST_LIST=%TEST_LIST%;Cart/VerifySubscriptionInCartPage
REM Test Cases Page Tests
set TEST_LIST=%TEST_LIST%;TestCases/VerifyTestCasesPage
REM Add more tests below:
REM set TEST_LIST=%TEST_LIST%;FolderName/YourTestName
REM ============================================================================

REM ======== Create Reports Directory ========
if not exist "TestReports" mkdir TestReports

REM Change to project directory
cd /d "%PROJECT_DIR%"

echo [INFO] Current Directory: %CD%
echo [INFO] Browser: %BROWSER%
echo [INFO] Workers: %WORKERS%
echo [INFO] Execution Mode: Parallel (All specs in one consolidated report)
echo.

REM Build the test files string for parallel execution
set TEST_FILES=
for %%a in (%TEST_LIST:;= %) do (
    if defined TEST_FILES (
        set TEST_FILES=!TEST_FILES! tests/%%a.spec.js
    ) else (
        set TEST_FILES=tests/%%a.spec.js
    )
)

echo [INFO] Test Files: %TEST_FILES%
echo.

REM Timestamp for unique report folder name
for /f "delims=" %%t in ('powershell -NoProfile -Command "Get-Date -Format \"yyyyMMdd_HHmmss\""') do set TIMESTAMP=%%t

REM ============================================================================
REM Execute Test Suites in Parallel
REM ============================================================================
echo ----------------------------------------------------------------------------
echo Executing Test Suites in Parallel...
echo ----------------------------------------------------------------------------
echo.

REM Execute tests and capture output (strip ANSI codes)
call npx playwright test %TEST_FILES% --project=%BROWSER% --workers=%WORKERS% --reporter=list,html 2>&1 ^|
    powershell -Command "$input | ForEach-Object { $_ -replace '\x1b\[[0-9;]*m', '' }" > temp_parallel_output.txt
set TEST_EXIT_CODE=!errorlevel!

REM Display output to console
type temp_parallel_output.txt

REM Clean up temp file
del temp_parallel_output.txt 2>nul

REM Copy playwright-report folder with timestamp to TestReports
if exist "playwright-report" (
    set "REPORT_NAME=TestReports\playwright-report-parallel_!TIMESTAMP!"
    if exist "!REPORT_NAME!" (
        echo [INFO] Removing old report: !REPORT_NAME!
        rmdir /s /q "!REPORT_NAME!"
    )
    echo [INFO] Copying parallel report to !REPORT_NAME!
    xcopy "playwright-report" "!REPORT_NAME!" /E /I /Q >nul
    echo [SUCCESS] Consolidated parallel report saved at: !REPORT_NAME!\index.html
)

REM ============================================================================
REM Display Results
REM ============================================================================
echo.
echo ============================================================================
if !TEST_EXIT_CODE! NEQ 0 (
    echo   TEST EXECUTION FAILED - EXIT CODE: !TEST_EXIT_CODE!
    echo ============================================================================
    echo.
    echo [INFO] Reports Location: TestReports\playwright-report-parallel_*
    echo.
    exit /b 1
) else (
    echo   ALL TESTS PASSED SUCCESSFULLY!
    echo ============================================================================
    echo.
    echo [INFO] Reports Location: TestReports\playwright-report-parallel_*
    echo.
    exit /b 0
)
