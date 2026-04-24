import requests
import re

video_id = "BpNVaofShuE"
html_res = requests.get(f"https://www.youtube.com/watch?v={video_id}", timeout=5)
if html_res.status_code == 200:
    match = re.search(r'"channelId":"([^"]+)"', html_res.text)
    print("Channel ID:", match.group(1) if match else "Not found")
