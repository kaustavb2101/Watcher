@echo off
pushd "%~dp0"
echo Setting BOT_API_KEY (Interest Rates plan)...
echo eyJvcmciOiI2NzM1NzgwZWM4YzFlYjAwMDEyYTM3NzEiLCJpZCI6ImQ1ZGNjNzFhZjcxODRmNTBiMDc1NmUyNmUxNjUyYjdiIiwiaCI6Im11cm11cjEyOCJ9| vercel env add BOT_API_KEY production --force
echo Done BOT_API_KEY
echo Setting BOT_STATS_KEY (Statistics plan)...
echo eyJvcmciOiI2NzM1NzgwZWM4YzFlYjAwMDEyYTM3NzEiLCJpZCI6Ijg2MTI2MTVjYWNiZjQ3M2M4MGNhMmQ4ODZkOGY4YjJjIiwiaCI6Im11cm11cjEyOCJ9| vercel env add BOT_STATS_KEY production --force
echo Done BOT_STATS_KEY
echo All env vars set.
