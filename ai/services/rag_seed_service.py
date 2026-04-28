import json
import os
import uuid
import logging
from qdrant_client.models import PointStruct
from services.qdrant_service import qdrant_service
from services.embedding_service import embedding_service

logger = logging.getLogger(__name__)

class RagSeedService:
    def __init__(self):
        self.data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "rag")

    def initialize_collections_and_seed(self):
        """Creates collections and loads seed data into route_descriptions."""
        # 1. Create all collections
        created_collections = qdrant_service.create_collections_if_not_exist()
        
        results = {
            "created_collections": created_collections,
            "seed_results": {}
        }
        
        # 2. Seed route_descriptions if file exists and has data
        route_desc_file = os.path.join(self.data_dir, "route_descriptions.json")
        if os.path.exists(route_desc_file):
            try:
                with open(route_desc_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    
                if data and isinstance(data, list):
                    logger.info(f"Found {len(data)} items in route_descriptions.json. Upserting...")
                    points = []
                    
                    # We expect items to have at least some text content.
                    # As a generic fallback, we'll serialize the item or use a 'description' / 'text' field
                    for item in data:
                        text_to_embed = item.get("text") or item.get("description") or json.dumps(item, ensure_ascii=False)
                        item_id = item.get("id")
                        
                        # Generate embedding
                        embedding = embedding_service.embed_text(text_to_embed)
                        
                        # Generate deterministic UUID based on route name
                        # This prevents duplicates if /init is called multiple times
                        route_name = item.get("name", "unknown")
                        point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, route_name)) if not item_id else str(item_id)
                        
                        points.append(
                            PointStruct(
                                id=point_id,
                                vector=embedding,
                                payload=item
                            )
                        )
                    
                    if points:
                        success = qdrant_service.upsert_points("route_descriptions", points)
                        results["seed_results"]["route_descriptions"] = {
                            "status": "success" if success else "failed",
                            "count": len(points)
                        }
                else:
                    results["seed_results"]["route_descriptions"] = {"status": "skipped", "reason": "empty list"}
            except Exception as e:
                logger.error(f"Error seeding route_descriptions: {e}")
                results["seed_results"]["route_descriptions"] = {"status": "error", "message": str(e)}
        else:
            results["seed_results"]["route_descriptions"] = {"status": "skipped", "reason": "file not found"}
            
        return results

rag_seed_service = RagSeedService()
