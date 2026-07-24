$ErrorActionPreference = 'SilentlyContinue'
Remove-Item -LiteralPath "C:\Users\DELL\Downloads\CodeMind\.git\index.lock" -Force
$env:GIT_GC_AUTO = 0

$toadd = @(
    ".gitignore",
    "README.md",
    "requirements.txt",
    "app",
    "backend",
    "configs",
    "data",
    "docs",
    "llm",
    "models",
    "reranking",
    "retrieval",
    "scripts",
    "services",
    "tests",
    "utils",
    "deploy.bat",
    "deploy.sh",
    "docker-compose.yml",
    "Dockerfile.backend",
    "Dockerfile.frontend",
    "start_backend_test.bat",
    "test_endpoints.py",
    "test_generate_only.py",
    "test_simple.py",
    "test_with_long_timeout.py",
    "test_with_socket.py",
    "run_demo_simulation.py",
    "demo_metrics.py",
    "validate_deployment.py",
    "METRICS.md",
    "DESIGN_GUIDE.md",
    "DEPLOYMENT.md",
    "CODEMIND_EXHAUSTIVE_REPORT.md",
    "SESSION_STATE_BACKUP.md",
    "codemind_live_demo.html",
    "frontend\app",
    "frontend\components",
    "frontend\streamlit_app.py",
    "frontend\package.json",
    "frontend\postcss.config.js",
    "frontend\tsconfig.json",
    "frontend\tailwind.config.js",
    "frontend\types.d.ts",
    "frontend\verify_voice.py",
    "frontend\homepage.png",
    "frontend\next.config.js",
    "frontend\next-env.d.ts"
)

& git add @toadd
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& git commit -m "Initial commit: CodeMind Semantic Code Search"
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& git push -u origin master
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
