@echo off
chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion
set NO_COLOR=1
set FORCE_COLOR=0
set NODE_OPTIONS=--no-warnings
set PW_TEST_HTML_REPORT_OPEN=never
REM ============================================================================
REM Playwright Test Execution - Per-Spec Reports, Sequential
REM Description: Runs each listed spec separately so each gets its own HTML report
REM (copied under TestReports\<spec>_timestamp). Tests continue even if a spec fails.
REM ============================================================================

REM ======== Configuration ========
set BROWSER=chromium
set WORKERS=1
set PROJECT_DIR=%~dp0
cd /d "%PROJECT_DIR%"

REM ======== Define Test Suites (FolderName/TestFileName without .spec.js) ========
set TEST_LIST=
REM Signup/Login Tests
set TEST_LIST=%TEST_LIST%;SignupLogin/SignupAndLoginCreationVerificationUpdated
@REM set TEST_LIST=%TEST_LIST%;SignupLogin/SignupAndLoginCreationVerificationUpdatedDataValuesFromExcel
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
REM Add more test files here like:
REM set TEST_LIST=%TEST_LIST%;FolderName/YourNewTestFile

REM ======== Create Reports Directory ========
if not exist "TestReports" mkdir TestReports

echo.
echo ============================================================================
echo   PLAYWRIGHT PER-SPEC RUN (SEQUENTIAL)
echo ============================================================================
echo [INFO] Browser: %BROWSER%
echo [INFO] Workers: %WORKERS%
echo [INFO] Each spec runs separately; each gets its own HTML report copy
echo ============================================================================
echo.

set TOTAL_TESTS=0
set FAILED_SUITES=0
set TEST_NUM=0

for %%a in (%TEST_LIST%) do (
    set /a TEST_NUM+=1
    set /a TOTAL_TESTS+=1

    REM Replace forward slashes with underscores for names
    set "TEMP_NAME=%%a"
    set "TEMP_NAME=!TEMP_NAME:/=_!"

    REM Timestamp for unique report folder names
    for /f "delims=" %%t in ('powershell -NoProfile -Command "Get-Date -Format \"yyyyMMdd_HHmmss\""') do set TIMESTAMP=%%t

    echo ----------------------------------------------------------------------------
    echo [!TEST_NUM!] Executing: %%a.spec.js
    echo ----------------------------------------------------------------------------
    echo.

    REM Execute test and capture output to temp file (strip ANSI codes)
    call npx playwright test tests/%%a.spec.js --project=%BROWSER% --workers=%WORKERS% --reporter=list,html 2>&1 ^|
        powershell -Command "$input | ForEach-Object { $_ -replace '\x1b\[[0-9;]*m', '' }" > temp_!TEMP_NAME!.txt
    set TEST_EXIT_CODE=!errorlevel!

    REM Display output to console
    type temp_!TEMP_NAME!.txt

    REM Clean up temp file
    del temp_!TEMP_NAME!.txt 2>nul

    REM Copy playwright-report folder with timestamp to TestReports (keeps original)
    if exist "playwright-report" (
        set "REPORT_NAME=TestReports\playwright-report-!TEMP_NAME!_!TIMESTAMP!"
        if exist "!REPORT_NAME!" (
            echo [INFO] Removing old report: !REPORT_NAME!
            rmdir /s /q "!REPORT_NAME!"
        )
        echo [INFO] Copying report to !REPORT_NAME!
        xcopy "playwright-report" "!REPORT_NAME!" /E /I /Q >nul
        echo [SUCCESS] Report saved at: !REPORT_NAME!\index.html
    )

    REM Check result
    if !TEST_EXIT_CODE! NEQ 0 (
        echo.
        echo [ERROR] %%a failed with exit code: !TEST_EXIT_CODE!
        echo.
        set /a FAILED_SUITES+=1
    ) else (
        echo.
        echo [SUCCESS] %%a completed successfully!
        echo.
    )
)

REM ======== Display Final Results ========
echo.
set /a PASSED_SUITES=!TOTAL_TESTS!-!FAILED_SUITES!
echo ============================================================================
echo                        EXECUTION SUMMARY
echo ============================================================================
echo [INFO] Total Test Files: !TOTAL_TESTS!
echo [INFO] Passed: !PASSED_SUITES!
echo [INFO] Failed: !FAILED_SUITES!
echo [INFO] Reports Location: TestReports\playwright-report-*
echo ============================================================================
echo.

if !FAILED_SUITES! GTR 0 (
    echo [WARNING] !FAILED_SUITES! test suite(s) failed. Check per-spec folders under TestReports.
    echo.
    exit /b 1
) else (
    echo [SUCCESS] All test suites completed (some may still have individual failures, see folders).
    echo.
    exit /b 0
)