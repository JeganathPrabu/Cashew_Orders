# Starts the local static server for the site on port 5173.
# Stops any stale server already holding the port (Python's http.server on Windows
# can silently share a port, so an old server serving the wrong folder would keep
# answering requests), and serves public/ by absolute path so the working
# directory the task is launched from doesn't matter.

$port = 5173
$root = Join-Path (Split-Path $PSScriptRoot -Parent) 'public'

Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue |
    Select-Object -ExpandProperty OwningProcess -Unique |
    ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }

# dev_server.py sends no-store headers so edited files show on a normal refresh;
# -u: unbuffered output so VS Code sees "Serving HTTP" and the debugger can launch
python -u (Join-Path $PSScriptRoot 'dev_server.py') $port $root
