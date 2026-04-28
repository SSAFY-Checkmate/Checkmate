from services.analysis.steps.semantic_router import semantic_router

res = semantic_router.route_claim("이 다이어트 보조제는 일주일 만에 체지방을 10kg 줄여준다.")
print("ROUTER RESULT:", res)
