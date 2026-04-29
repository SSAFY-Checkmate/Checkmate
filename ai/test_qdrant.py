import json
from services.qdrant_service import qdrant_service

try:
    res = qdrant_service.client.scroll(
        collection_name="route_descriptions",
        limit=10,
        with_payload=True,
        with_vectors=False
    )
    print("QDRANT_SCROLL_RESULT:", len(res[0]), "items")
    for pt in res[0]:
        print("PAYLOAD:", pt.payload)
except Exception as e:
    print("ERROR:", e)
