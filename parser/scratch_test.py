from youtube_transcript_api import proxies
import inspect
print(dir(proxies))
if hasattr(proxies, 'ProxyConfig'):
    print(inspect.signature(proxies.ProxyConfig.__init__))
