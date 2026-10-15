@echo off
cd /d "%~dp0"
echo Open http://localhost:4173 in your browser.
echo Keep this window open while playing. Press Ctrl+C to stop.
node server.mjs
pause
