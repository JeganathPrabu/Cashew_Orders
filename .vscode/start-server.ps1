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

# -u: unbuffered output so VS Code sees "Serving HTTP" and the debugger can launch
python -u -m http.server $port --bind 127.0.0.1 --directory $root
