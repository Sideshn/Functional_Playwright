pipeline {
    agent any
    
    // Environment variables
    environment {
        NODE_VERSION = '18'  // Node.js version required
        // Cache browsers in a persistent location outside workspace
        PLAYWRIGHT_BROWSERS_PATH = 'C:\\ProgramData\\Jenkins\\.playwright-browsers'
    }
    
    // Build parameters for flexibility
    parameters {
        choice(
            name: 'TEST_SUITE', 
            choices: ['all', 'cart', 'products', 'signup', 'contact', 'homepage', 'navigation', 'testcases'], 
            description: 'Select test suite to run'
        )
        choice(
            name: 'BROWSER', 
            choices: ['chromium', 'firefox', 'webkit'], 
            description: 'Select browser'
        )
        string(
            name: 'WORKERS', 
            defaultValue: '1', 
            description: 'Number of parallel workers'
        )
        booleanParam(
            name: 'GENERATE_VIDEO', 
            defaultValue: false, 
            description: 'Record video for all tests'
        )
    }
    
    options {
        // Keep only last 10 builds
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // Timeout after 2 hours
        timeout(time: 120, unit: 'MINUTES')
        // Add timestamps to console output
        timestamps()
        // Disable concurrent builds
        disableConcurrentBuilds()
    }
    
    stages {
        stage('Clean Workspace') {
            steps {
                script {
                    echo "🧹 Cleaning workspace before checkout..."
                    cleanWs()
                }
            }
        }
        
        stage('Checkout') {
            steps {
                script {
                    echo "🔍 Checking out code..."
                    checkout scm
                }
            }
        }
        
        stage('Setup Node.js') {
            steps {
                script {
                    echo "📦 Setting up Node.js ${NODE_VERSION}..."
                    // Using NodeJS plugin - configure in Jenkins Global Tool Configuration
                    nodejs(nodeJSInstallationName: "NodeJS ${NODE_VERSION}") {
                        bat 'node --version'
                        bat 'npm --version'
                    }
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    echo "📥 Installing npm dependencies..."
                    nodejs(nodeJSInstallationName: "NodeJS ${NODE_VERSION}") {
                        bat 'npm install'  // Use install since package-lock.json may not exist
                        bat 'npm install --save-dev allure-playwright allure-commandline'  // Install Allure reporter
                    }
                }
            }
        }
        
        stage('Install Playwright Browsers') {
            steps {
                script {
                    echo "🌐 Installing Playwright browser: ${params.BROWSER}..."
                    nodejs(nodeJSInstallationName: "NodeJS ${NODE_VERSION}") {
                        // Install only the selected browser to save time
                        echo "Installing ${params.BROWSER}..."
                        bat "npx playwright install --with-deps ${params.BROWSER}"
                    }
                }
            }
        }
        
        stage('Run Tests') {
            steps {
                script {
                    echo "🧪 Running Playwright UI tests..."
                    
                    def testCommand = 'npx playwright test'
                    def testPath = ''
                    
                    // Select test path based on TEST_SUITE parameter
                    if (params.TEST_SUITE == 'all') {
                        testPath = 'tests'
                    } else if (params.TEST_SUITE == 'cart') {
                            testPath = 'tests/Cart'
                        } else if (params.TEST_SUITE == 'products') {
                            testPath = 'tests/Product'
                        } else if (params.TEST_SUITE == 'signup') {
                            testPath = 'tests/SignupLogin'
                        } else if (params.TEST_SUITE == 'contact') {
                            testPath = 'tests/ContactUs'
                        } else if (params.TEST_SUITE == 'homepage') {
                            testPath = 'tests/HomePage'
                        } else if (params.TEST_SUITE == 'navigation') {
                            testPath = 'tests/Navigation'
                        } else if (params.TEST_SUITE == 'testcases') {
                        testPath = 'tests/TestCases'
                    }
                    
                    // Add test path to command if specified
                    if (testPath != '') {
                        testCommand += " ${testPath}"
                    }
                    
                    // Add browser selection
                    testCommand += " --project=${params.BROWSER}"
                    
                    // Run in headless mode for CI (faster execution)
                    // testCommand += ' --headed'  // Uncomment for local debugging only
                    
                    // Add workers configuration
                    testCommand += " --workers=${params.WORKERS}"
                    
                    // Add reporters: HTML, list, and Allure  
                    testCommand += ' --reporter=html,list,allure-playwright'
                    
                    // Add debug output to see actual errors
                    testCommand += ' --reporter=line'
                    
                    echo "Executing: ${testCommand}"
                    
                    nodejs(nodeJSInstallationName: "NodeJS ${NODE_VERSION}") {
                        // Use returnStatus to prevent build failure on test failures
                        def testResult = bat(script: testCommand, returnStatus: true)
                        
                        // Store test result but continue to publish reports
                        if (testResult != 0) {
                            currentBuild.result = 'UNSTABLE'
                            echo "⚠️ Some tests failed. Check the reports for details."
                        } else {
                            echo "✅ All tests passed successfully!"
                        }
                    }
                }
            }
        }
    }
    
    post {
        always {
            echo "📝 Publishing test results and artifacts..."
            
            // Generate and publish Allure report
            script {
                nodejs(nodeJSInstallationName: "NodeJS ${NODE_VERSION}") {
                    bat 'npx allure generate allure-results --clean -o allure-report'
                }
            }
            
            allure([
                includeProperties: false,
                jdk: '',
                results: [[path: 'allure-results']]
            ])
            
            // Archive HTML report
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'playwright-report',
                reportFiles: 'index.html',
                reportName: 'Playwright Test Report',
                reportTitles: 'Playwright Test Results'
            ])
            
            // Archive test artifacts
            archiveArtifacts artifacts: 'test-results/**/*', allowEmptyArchive: true
            archiveArtifacts artifacts: 'playwright-report/**/*', allowEmptyArchive: true
            archiveArtifacts artifacts: 'TestReports/**/*', allowEmptyArchive: true
            archiveArtifacts artifacts: 'allure-results/**/*', allowEmptyArchive: true
            archiveArtifacts artifacts: 'allure-report/**/*', allowEmptyArchive: true
            
            // Archive screenshots and videos
            archiveArtifacts artifacts: 'test-results/**/screenshots/**/*.png', allowEmptyArchive: true
            archiveArtifacts artifacts: 'test-results/**/videos/**/*.webm', allowEmptyArchive: true
            
            // Clean workspace if needed
            cleanWs(
                cleanWhenNotBuilt: false,
                deleteDirs: true,
                disableDeferredWipeout: true,
                notFailBuild: true,
                patterns: [
                    [pattern: 'node_modules/', type: 'INCLUDE'],
                    [pattern: '.playwright/', type: 'INCLUDE'],
                    [pattern: 'test-results/', type: 'INCLUDE'],
                    [pattern: 'allure-results/', type: 'INCLUDE'],
                    [pattern: 'allure-report/', type: 'INCLUDE']
                ]
            )
        }
        
        success {
            echo "✅ Pipeline completed successfully!"
            // Add notifications here (email, Slack, Teams, etc.)
            // Example:
            // emailext(
            //     subject: "✅ Build ${env.BUILD_NUMBER} - SUCCESS",
            //     body: "Build ${env.BUILD_NUMBER} completed successfully!\nSuite: ${params.TEST_SUITE}\nBrowser: ${params.BROWSER}",
            //     to: "team@example.com"
            // )
        }
        
        failure {
            echo "❌ Pipeline failed!"
            // Add failure notifications here
            // emailext(
            //     subject: "❌ Build ${env.BUILD_NUMBER} - FAILED",
            //     body: "Build ${env.BUILD_NUMBER} failed!\nCheck Jenkins for details.",
            //     to: "team@example.com"
            // )
        }
        
        unstable {
            echo "⚠️ Pipeline completed with test failures!"
            // Add unstable notifications here
            // emailext(
            //     subject: "⚠️ Build ${env.BUILD_NUMBER} - UNSTABLE",
            //     body: "Build ${env.BUILD_NUMBER} has test failures!\nSuite: ${params.TEST_SUITE}\nBrowser: ${params.BROWSER}",
            //     to: "team@example.com"
            // )
        }
    }
}
