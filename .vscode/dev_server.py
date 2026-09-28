# Local static server for public/ that disables browser caching, so edited
# images, CSS and JS show up on a normal refresh during development.
import functools
import http.server
import sys


class NoCacheHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


port, root = int(sys.argv[1]), sys.argv[2]
handler = functools.partial(NoCacheHandler, directory=root)
with http.server.ThreadingHTTPServer(("127.0.0.1", port), handler) as httpd:
    print(f"Serving HTTP on 127.0.0.1 port {port} (http://127.0.0.1:{port}/) ...", flush=True)
    httpd.serve_forever()
