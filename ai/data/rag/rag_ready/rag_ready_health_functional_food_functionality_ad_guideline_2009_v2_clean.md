# 건강기능식품 기능성 표시·광고 가이드라인 - RAG Ready v2 Clean

## 문서 메타데이터
- 문서명: 건강기능식품 기능성 표시·광고 가이드라인
- 발간등록번호: 11-1470000-001876-01
- 발간일: 2009. 3.
- 발간기관: 식품의약품안전청 영양기능식품국
- 문서유형: 건강기능식품 기능성 표시·광고 가이드라인
- 법적 효력: 법적 구속력 없음. 실제 법적 판단 시 관련 법령 및 고시 전문 확인 필요
- 전처리 방식: OCR 원문 표를 그대로 보존하지 않고, 임베딩에 필요한 규칙·원료·기능성 중심으로 재구성
- 주의: 본 파일은 RAG 검색용 정리본이며, 원문 전체의 법적 효력을 대체하지 않는다.

## 청킹 기준

- 기본 원칙: 원칙 1개 = 청크 1개
- 세부 기준: 기준 1개 = 청크 1개
- 원료별 기능성: 원료 1개 = 청크 1개
- 기능성별 원료 매핑: 기능성 내용 1개 = 청크 1개
- 임베딩 권장 필드: `RAG 검색용 요약`, `허용 가능 표현`, `금지/주의 표현`, `기능성 내용`
- payload 보존 권장 필드: 문서명, 발간일, section, source_type, guideline_id, 기능성 원료, 기능성 내용

## 발간사 및 활용상 주의

- RAG 검색용 요약: 이 가이드라인은 건강기능식품 기능성 표시·광고 범위에 대한 이해를 돕기 위해 만든 참고자료이며, 법적 구속력은 없다.
- 법적 판단 시 관련 법령 및 고시 전문을 확인해야 한다.
- 표현 가능 사례에 포함되어 있더라도 실제 광고물의 전체 문맥상 허위·과대광고 우려가 있거나 단편적 단어·문장을 조합해 소비자를 오인시키는 경우에는 사용할 수 없다.
- 구공전과 신공전의 기능성 내용이 다른 경우, 해당 제품의 품목제조신고 또는 수입신고 시 적용된 기준 및 규격을 기준으로 판단해야 한다.

## 1. 기본 원칙

### 기본 원칙 1. 국민 건강증진 및 소비자 보호

- chunk_id: hff_functionality_ad_2009_principle_policy
- source_type: guideline_principle
- domain: health_functional_food_ad
- RAG 검색용 요약: 건강기능식품 기능성 표시·광고는 국민 건강증진 및 소비자 보호에 관한 국가정책에 기여해야 한다.
- 세부 내용:
  - 건강기능식품은 인체에 유익한 기능성을 가진 원료나 성분을 사용하여 제조·가공한 식품이다.
  - 소비자에게 유용한 보건용도가 있는 양질의 건강기능식품과 올바른 정보를 제공해야 한다.

### 기본 원칙 2. 과학적·객관적 근거자료 기반 표현

- chunk_id: hff_functionality_ad_2009_principle_evidence
- source_type: guideline_principle
- domain: health_functional_food_ad
- RAG 검색용 요약: 안전성, 기능성 등에 관한 표현은 과학적 평가체계에 의해 인정된 사실과 객관적 근거자료에 기반해야 한다.
- 세부 내용:
  - 과학적 증명자료는 해당 과학분야 전문가에 의한 증명 또는 합의된 객관적 사실에 근거해야 한다.
  - 확인되지 않은 기능성 또는 단정적 효능 표현은 피해야 한다.

### 기본 원칙 3. 소비자의 합리적 선택을 위한 올바른 정보 제공

- chunk_id: hff_functionality_ad_2009_principle_correct_information
- source_type: guideline_principle
- domain: health_functional_food_ad
- RAG 검색용 요약: 소비자에게 과학적이고 객관적인 자료에 근거한 올바른 정보를 제공하여 합리적 선택을 가능하게 해야 한다.
- 세부 내용:
  - 의약품이나 질병 치료 효과가 있는 것으로 오인될 우려가 있는 표현은 사용할 수 없다.

### 기본 원칙 4. 관련 법령 적합성

- chunk_id: hff_functionality_ad_2009_principle_law_compliance
- source_type: guideline_principle
- domain: health_functional_food_ad
- RAG 검색용 요약: 건강기능식품 기능성 표시·광고는 건강기능식품에 관한 법률, 표시·광고 관련 법률 등 관련 법령에 적합해야 한다.
- 세부 내용:
  - 허위·과대 표시·광고 금지, 기능성 표시·광고 심의, 건강기능식품 표시기준 등을 따라야 한다.
  - 식품위생법, 건강증진법, 소비자기본법 등 관련 법령도 적용될 수 있다.

## 2. 세부 기준

### 세부 기준 1. 학술문헌 인용

- chunk_id: hff_functionality_ad_2009_academic_literature
- source_type: guideline_rule
- domain: health_functional_food_ad
- RAG 검색용 요약: 학술문헌의 연구내용을 인용할 때는 과학적 근거자료에 의한 객관적 사실만 표현해야 하며, 인정된 기능성 내용 범위 안에서만 인용할 수 있다.
- 허용 가능 표현/조건:
  - 국내외 권위 있는 학술지에 게재된 연구자료를 객관적 사실 그대로 인용하는 표현
  - SCI, SSCI 등재 학술지 또는 이와 동등한 수준의 연구자료에 근거한 표현
  - 원문 고유의 의미가 변하지 않는 범위에서 그래프, 도표, 그림을 활용하는 표현
- 금지 또는 주의 표현:
  - 동물실험이나 시험관실험 결과를 인체 효과로 직접·간접 단정하는 표현
  - 연구자료 중 유리한 부분만 발췌하거나 편집하여 원문 의미를 바꾸는 표현
  - 질병 치료 또는 의약품 효능으로 오인될 수 있는 연구내용 인용

### 세부 기준 2. 특허 명칭 및 내용 표현

- chunk_id: hff_functionality_ad_2009_patent
- source_type: guideline_rule
- domain: health_functional_food_ad
- RAG 검색용 요약: 특허등록 제품이나 원료 성분의 제조방법, 조성물, 용도 등에 관한 특허 내용은 객관적 사실에 근거해 표현할 수 있으나, 의약품으로 오인되거나 인정되지 않은 기능성 내용은 표현할 수 없다.
- 허용 가능 표현/조건:
  - 특허의 제조방법, 조성물 등 특허 취득 사실을 객관적으로 알리는 표현
  - 인정된 기능성 내용 범위 안에서 특허 명칭이나 내용을 설명하는 표현
- 금지 또는 주의 표현:
  - 특허 출원 사실만으로 기능성을 암시하는 표현
  - 질병명, 질병 증상, 치료 효능이 포함된 특허명을 광고에 인용하는 표현
  - 부원료 또는 식품첨가물 관련 특허를 주원료 기능성처럼 표현하는 경우

### 세부 기준 3. 서적·통계·언론자료 등 일반정보 인용

- chunk_id: hff_functionality_ad_2009_general_information
- source_type: guideline_rule
- domain: health_functional_food_ad
- RAG 검색용 요약: 서적, 통계자료, 언론자료 등 일반정보를 인용할 때는 제품정보와 일반정보를 명확히 구분하고, 공익 또는 교육 목적의 객관적 사실로 표현해야 한다.
- 허용 가능 표현/조건:
  - 제품 기능성 내용과 관련된 건강정보 또는 과학정보를 별도 제목으로 구분하여 제공하는 표현
  - 해당 제품과 직접 관련성이 인정되는 언론자료를 객관적 사실에 근거해 인용하는 표현
  - 전문가에 의해 합의된 과학적 근거가 있는 자가진단 체크리스트를 소비자 정보 차원에서 제시하는 경우
- 금지 또는 주의 표현:
  - 보건의료 정보를 이용해 제품이 질병 예방 또는 치료 효과가 있는 것처럼 오인시키는 표현
  - 과학적으로 증빙되지 않은 보도 제목이나 내용을 제품 광고에 활용하는 표현
  - 자가진단 체크리스트를 통해 질병 치료 효과를 암시하는 표현

### 세부 기준 4. 전문가 추천·보증·수상·선정 표현

- chunk_id: hff_functionality_ad_2009_recommendation_award
- source_type: guideline_rule
- domain: health_functional_food_ad
- RAG 검색용 요약: 의사, 한의사 등 전문가 및 그 밖의 자에 의한 추천, 보증, 수상, 선정 표현은 사실이 아니거나 소비자를 오인할 수 있으면 사용할 수 없다.
- 허용 가능 표현/조건:
  - 해당 제품 연구개발자가 객관적 사실만을 설명하는 표현
  - 실제 사용 경험에 근거하여 인정된 기능성 내용 또는 일반 건강 관련 표현을 하는 소비자 의견
- 금지 또는 주의 표현:
  - 의사 또는 전문가가 질병 치료 효과를 강력 추천하거나 보장하는 표현
  - 소비자가 몇 kg 감량되었다는 식의 단정적 체험담
  - 제품 일부 기술에 대한 수상·인증을 제품 전체의 우수성처럼 표현하는 경우
  - 실존하지 않는 소비자의 섭취 사실 또는 체험담

### 세부 기준 5. 공공기관·정부단체·학교·국제기구 명칭 표현

- chunk_id: hff_functionality_ad_2009_institution_name
- source_type: guideline_rule
- domain: health_functional_food_ad
- RAG 검색용 요약: 공공기관, 정부단체, 학교, 국제기구 등의 명칭을 광고에 사용하려면 공식 공문 등 객관적 근거가 있어야 하며, 기관명으로 기능성을 인정받은 것처럼 오인시켜서는 안 된다.
- 허용 가능 표현/조건:
  - 기관장 또는 조직의 부속기관장이 광고 가능 공문을 제출한 경우의 객관적 표현
- 금지 또는 주의 표현:
  - 공공기관에서 품질검사를 받은 사실을 제품 기능성 인정처럼 표현하는 경우
  - 인정·등록·허가되지 않은 FDA, GMP, JHFA, HACCP 등 표현으로 우수성을 암시하는 경우
  - 암치료연구소, 심장질환연구센터처럼 질병명과 유사한 명칭을 강조하는 표현

### 세부 기준 6. 비교 표시·광고

- chunk_id: hff_functionality_ad_2009_comparative_ad
- source_type: guideline_rule
- domain: health_functional_food_ad
- RAG 검색용 요약: 비교 표시·광고는 소비자에게 유용하고 정확한 정보를 제공해야 하며, 비교대상, 비교기준, 비교내용, 비교방법이 명확하고 객관적이어야 한다.
- 허용 가능 표현/조건:
  - 동일 시장에서 주된 경쟁관계에 있는 동종 또는 유사 제품을 객관적 기준으로 비교하는 표현
  - 가격, 기능성, 품질, 판매량 등 비교기준이 동일하고 적정하게 설정된 경우
  - 공신력 있는 시험·조사기관의 객관적이고 타당한 시험·조사 결과를 정확히 인용하는 경우
- 금지 또는 주의 표현:
  - 주관적 판단, 경험, 체험, 평가를 근거로 다른 사업자 제품과 비교하는 표현
  - 당뇨병 환자 섭취에 좋다는 식으로 질병 관련 우수성을 비교하는 표현
  - 타 제품보다 기능성분이 몇 배 많아 기능이 차별화된다는 식의 과장 비교

### 세부 기준 7. 건강기능식품과 일반식품의 동일 광고면 광고

- chunk_id: hff_functionality_ad_2009_combined_food_ad
- source_type: guideline_rule
- domain: health_functional_food_ad
- RAG 검색용 요약: 건강기능식품과 일반식품은 함께 동일 광고면에 광고하지 않는 것을 원칙으로 하며, 동시에 광고할 경우 명확히 구분해야 한다.
- 허용 가능 표현/조건:
  - 건강기능식품과 일반식품을 선이나 구획으로 명확히 구분하여 설명하는 경우
  - 일반식품 주변에 ‘이 제품은 건강기능식품이 아닌 일반식품입니다’라는 내용을 표시하는 경우
- 금지 또는 주의 표현:
  - 건강기능식품과 일반식품이 구분되지 않은 상태에서 기능성 표현이 양 제품에 겹쳐 보이는 광고

### 세부 기준 8. 특정 제품 과다섭취 조장 표현

- chunk_id: hff_functionality_ad_2009_overconsumption
- source_type: guideline_rule
- domain: health_functional_food_ad
- RAG 검색용 요약: 특정 제품의 과다섭취를 조장하거나 균형 잡힌 식사를 비난·대체하는 것으로 오인될 우려가 있는 표현은 사용할 수 없다.
- 금지 또는 주의 표현:
  - 영양소 기준치가 있음에도 과량 섭취해도 좋다는 표현
  - 건강기능식품이 과일, 야채 등 대체식품과 동일하거나 대체 가능하다는 표현
  - 잘못된 식습관을 유지하면서 건강기능식품 섭취를 권장하는 표현

### 세부 기준 9. 제약회사 개발제품·병원·약국 판매제품 강조 표현

- chunk_id: hff_functionality_ad_2009_pharma_hospital_pharmacy
- source_type: guideline_rule
- domain: health_functional_food_ad
- RAG 검색용 요약: 제약회사 개발제품, 병원 판매제품, 약국 판매제품임을 표현할 때는 소비자가 의약품으로 오인하지 않는 범위에서 간단히 표현해야 한다.
- 허용 가능 표현/조건:
  - 병원 또는 약국의 건강기능식품 코너에서 판매하고 있다는 단순 사실 표현
- 금지 또는 주의 표현:
  - 제약회사 제품임을 반복 강조하여 의약품 효능·효과가 있는 것처럼 보이게 하는 표현
  - 병원용, 약국용, 병원·약국에서만 판매한다는 표현

## 3. 원료별 기능성 내용

- 설명: 아래 항목은 원료 또는 품목별 제조기준과 기능성 내용을 RAG 검색용으로 정리한 것이다.
- 청킹 권장: 원료 1개를 하나의 청크로 임베딩한다.

### 원료 1. 인삼

- chunk_id: hff_functionality_ad_2009_material_001
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 인삼
- 제조기준 요약: 진세노사이드 Rg1과 Rb1 함유
- 기능성 내용: 면역력 증진, 피로 회복
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 인삼은(는) 진세노사이드 Rg1과 Rb1 함유 기준과 관련되며, 기능성 내용은 면역력 증진, 피로 회복이다.

### 원료 2. 홍삼

- chunk_id: hff_functionality_ad_2009_material_002
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 홍삼
- 제조기준 요약: 진세노사이드 Rg1과 Rb1 함유
- 기능성 내용: 면역력 증진, 피로 회복, 혈소판 응집 억제를 통한 혈액 흐름에 도움
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 홍삼은(는) 진세노사이드 Rg1과 Rb1 함유 기준과 관련되며, 기능성 내용은 면역력 증진, 피로 회복, 혈소판 응집 억제를 통한 혈액 흐름에 도움이다.

### 원료 3. 엽록소 함유 식물

- chunk_id: hff_functionality_ad_2009_material_003
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 엽록소 함유 식물
- 제조기준 요약: 총 엽록소 함유
- 기능성 내용: 피부 건강에 도움, 항산화 작용
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 엽록소 함유 식물은(는) 총 엽록소 함유 기준과 관련되며, 기능성 내용은 피부 건강에 도움, 항산화 작용이다.

### 원료 4. 스피루리나/클로렐라

- chunk_id: hff_functionality_ad_2009_material_004
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 스피루리나/클로렐라
- 제조기준 요약: 총 엽록소 함유
- 기능성 내용: 피부 건강에 도움, 항산화 작용
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 스피루리나/클로렐라은(는) 총 엽록소 함유 기준과 관련되며, 기능성 내용은 피부 건강에 도움, 항산화 작용이다.

### 원료 5. 녹차추출물

- chunk_id: hff_functionality_ad_2009_material_005
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 녹차추출물
- 제조기준 요약: 카테킨 함유
- 기능성 내용: 항산화 작용
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 녹차추출물은(는) 카테킨 함유 기준과 관련되며, 기능성 내용은 항산화 작용이다.

### 원료 6. 알로에 전잎

- chunk_id: hff_functionality_ad_2009_material_006
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 알로에 전잎
- 제조기준 요약: 안트라퀴논계 화합물 함유
- 기능성 내용: 배변활동 원활
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 알로에 전잎은(는) 안트라퀴논계 화합물 함유 기준과 관련되며, 기능성 내용은 배변활동 원활이다.

### 원료 7. 프로폴리스추출물

- chunk_id: hff_functionality_ad_2009_material_007
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 프로폴리스추출물
- 제조기준 요약: 총 플라보노이드 함유 및 지표성분 확인
- 기능성 내용: 항산화 작용, 구강에서의 항균 작용
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 프로폴리스추출물은(는) 총 플라보노이드 함유 및 지표성분 확인 기준과 관련되며, 기능성 내용은 항산화 작용, 구강에서의 항균 작용이다.

### 원료 8. 오메가-3 지방산 함유 유지

- chunk_id: hff_functionality_ad_2009_material_008
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 오메가-3 지방산 함유 유지
- 제조기준 요약: EPA와 DHA 함유
- 기능성 내용: 혈중 중성지질 개선, 혈행 개선
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 오메가-3 지방산 함유 유지은(는) EPA와 DHA 함유 기준과 관련되며, 기능성 내용은 혈중 중성지질 개선, 혈행 개선이다.

### 원료 9. 감마리놀렌산 함유 유지

- chunk_id: hff_functionality_ad_2009_material_009
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 감마리놀렌산 함유 유지
- 제조기준 요약: 감마리놀렌산 함유
- 기능성 내용: 콜레스테롤 개선, 혈행 개선
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 감마리놀렌산 함유 유지은(는) 감마리놀렌산 함유 기준과 관련되며, 기능성 내용은 콜레스테롤 개선, 혈행 개선이다.

### 원료 10. 레시틴

- chunk_id: hff_functionality_ad_2009_material_010
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 레시틴
- 제조기준 요약: 인지질 함유
- 기능성 내용: 콜레스테롤 개선
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 레시틴은(는) 인지질 함유 기준과 관련되며, 기능성 내용은 콜레스테롤 개선이다.

### 원료 11. 스쿠알렌

- chunk_id: hff_functionality_ad_2009_material_011
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 스쿠알렌
- 제조기준 요약: 스쿠알렌 함유
- 기능성 내용: 항산화 작용
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 스쿠알렌은(는) 스쿠알렌 함유 기준과 관련되며, 기능성 내용은 항산화 작용이다.

### 원료 12. 식물스테롤/식물스테롤에스테르

- chunk_id: hff_functionality_ad_2009_material_012
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 식물스테롤/식물스테롤에스테르
- 제조기준 요약: 식물스테롤 함유
- 기능성 내용: 콜레스테롤 개선
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 식물스테롤/식물스테롤에스테르은(는) 식물스테롤 함유 기준과 관련되며, 기능성 내용은 콜레스테롤 개선이다.

### 원료 13. 알콕시글리세롤 함유 상어간유

- chunk_id: hff_functionality_ad_2009_material_013
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 알콕시글리세롤 함유 상어간유
- 제조기준 요약: 알콕시글리세롤 함유
- 기능성 내용: 면역력 증진
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 알콕시글리세롤 함유 상어간유은(는) 알콕시글리세롤 함유 기준과 관련되며, 기능성 내용은 면역력 증진이다.

### 원료 14. 옥타코사놀 함유 유지

- chunk_id: hff_functionality_ad_2009_material_014
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 옥타코사놀 함유 유지
- 제조기준 요약: 옥타코사놀 함유
- 기능성 내용: 지구력 증진
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 옥타코사놀 함유 유지은(는) 옥타코사놀 함유 기준과 관련되며, 기능성 내용은 지구력 증진이다.

### 원료 15. 매실추출물

- chunk_id: hff_functionality_ad_2009_material_015
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 매실추출물
- 제조기준 요약: 구연산 함유
- 기능성 내용: 피로 개선
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 매실추출물은(는) 구연산 함유 기준과 관련되며, 기능성 내용은 피로 개선이다.

### 원료 16. 글루코사민

- chunk_id: hff_functionality_ad_2009_material_016
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 글루코사민
- 제조기준 요약: 글루코사민황산염 또는 염산염 함유
- 기능성 내용: 관절 및 연골 건강에 도움
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 글루코사민은(는) 글루코사민황산염 또는 염산염 함유 기준과 관련되며, 기능성 내용은 관절 및 연골 건강에 도움이다.

### 원료 17. N-아세틸글루코사민

- chunk_id: hff_functionality_ad_2009_material_017
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: N-아세틸글루코사민
- 제조기준 요약: N-아세틸글루코사민 함유
- 기능성 내용: 관절 및 연골 건강에 도움
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 N-아세틸글루코사민은(는) N-아세틸글루코사민 함유 기준과 관련되며, 기능성 내용은 관절 및 연골 건강에 도움이다.

### 원료 18. 뮤코다당·단백

- chunk_id: hff_functionality_ad_2009_material_018
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 뮤코다당·단백
- 제조기준 요약: 뮤코다당·단백 함유
- 기능성 내용: 관절 및 연골 건강에 도움
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 뮤코다당·단백은(는) 뮤코다당·단백 함유 기준과 관련되며, 기능성 내용은 관절 및 연골 건강에 도움이다.

### 원료 19. 구아검/구아검가수분해물

- chunk_id: hff_functionality_ad_2009_material_019
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 구아검/구아검가수분해물
- 제조기준 요약: 식이섬유 함유
- 기능성 내용: 콜레스테롤 개선, 식후 혈당상승 억제, 배변활동 원활
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 구아검/구아검가수분해물은(는) 식이섬유 함유 기준과 관련되며, 기능성 내용은 콜레스테롤 개선, 식후 혈당상승 억제, 배변활동 원활이다.

### 원료 20. 글루코만난

- chunk_id: hff_functionality_ad_2009_material_020
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 글루코만난
- 제조기준 요약: 식이섬유 함유
- 기능성 내용: 콜레스테롤 개선, 배변활동 원활
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 글루코만난은(는) 식이섬유 함유 기준과 관련되며, 기능성 내용은 콜레스테롤 개선, 배변활동 원활이다.

### 원료 21. 귀리 식이섬유

- chunk_id: hff_functionality_ad_2009_material_021
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 귀리 식이섬유
- 제조기준 요약: 식이섬유 함유
- 기능성 내용: 콜레스테롤 개선, 식후 혈당상승 억제
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 귀리 식이섬유은(는) 식이섬유 함유 기준과 관련되며, 기능성 내용은 콜레스테롤 개선, 식후 혈당상승 억제이다.

### 원료 22. 난소화성 말토덱스트린

- chunk_id: hff_functionality_ad_2009_material_022
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 난소화성 말토덱스트린
- 제조기준 요약: 식이섬유 함유
- 기능성 내용: 식후 혈당상승 억제, 배변활동 원활
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 난소화성 말토덱스트린은(는) 식이섬유 함유 기준과 관련되며, 기능성 내용은 식후 혈당상승 억제, 배변활동 원활이다.

### 원료 23. 대두 식이섬유

- chunk_id: hff_functionality_ad_2009_material_023
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 대두 식이섬유
- 제조기준 요약: 식이섬유 함유
- 기능성 내용: 콜레스테롤 개선, 식후 혈당상승 억제, 배변활동 원활
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 대두 식이섬유은(는) 식이섬유 함유 기준과 관련되며, 기능성 내용은 콜레스테롤 개선, 식후 혈당상승 억제, 배변활동 원활이다.

### 원료 24. 목이버섯 식이섬유

- chunk_id: hff_functionality_ad_2009_material_024
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 목이버섯 식이섬유
- 제조기준 요약: 식이섬유 함유
- 기능성 내용: 배변활동 원활
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 목이버섯 식이섬유은(는) 식이섬유 함유 기준과 관련되며, 기능성 내용은 배변활동 원활이다.

### 원료 25. 밀 식이섬유

- chunk_id: hff_functionality_ad_2009_material_025
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 밀 식이섬유
- 제조기준 요약: 식이섬유 함유
- 기능성 내용: 식후 혈당상승 억제, 배변활동 원활
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 밀 식이섬유은(는) 식이섬유 함유 기준과 관련되며, 기능성 내용은 식후 혈당상승 억제, 배변활동 원활이다.

### 원료 26. 보리 식이섬유

- chunk_id: hff_functionality_ad_2009_material_026
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 보리 식이섬유
- 제조기준 요약: 식이섬유 함유
- 기능성 내용: 배변활동 원활
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 보리 식이섬유은(는) 식이섬유 함유 기준과 관련되며, 기능성 내용은 배변활동 원활이다.

### 원료 27. 아라비아검/아카시아검

- chunk_id: hff_functionality_ad_2009_material_027
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 아라비아검/아카시아검
- 제조기준 요약: 식이섬유 함유
- 기능성 내용: 배변활동 원활
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 아라비아검/아카시아검은(는) 식이섬유 함유 기준과 관련되며, 기능성 내용은 배변활동 원활이다.

### 원료 28. 옥수수겨 식이섬유

- chunk_id: hff_functionality_ad_2009_material_028
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 옥수수겨 식이섬유
- 제조기준 요약: 식이섬유 함유
- 기능성 내용: 콜레스테롤 개선, 식후 혈당상승 억제
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 옥수수겨 식이섬유은(는) 식이섬유 함유 기준과 관련되며, 기능성 내용은 콜레스테롤 개선, 식후 혈당상승 억제이다.

### 원료 29. 이눌린/치커리추출물

- chunk_id: hff_functionality_ad_2009_material_029
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 이눌린/치커리추출물
- 제조기준 요약: 식이섬유 함유
- 기능성 내용: 콜레스테롤 개선, 식후 혈당상승 억제, 배변활동 원활
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 이눌린/치커리추출물은(는) 식이섬유 함유 기준과 관련되며, 기능성 내용은 콜레스테롤 개선, 식후 혈당상승 억제, 배변활동 원활이다.

### 원료 30. 차전자피

- chunk_id: hff_functionality_ad_2009_material_030
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 차전자피
- 제조기준 요약: 식이섬유 함유
- 기능성 내용: 콜레스테롤 개선, 배변활동 원활
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 차전자피은(는) 식이섬유 함유 기준과 관련되며, 기능성 내용은 콜레스테롤 개선, 배변활동 원활이다.

### 원료 31. 폴리덱스트로스

- chunk_id: hff_functionality_ad_2009_material_031
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 폴리덱스트로스
- 제조기준 요약: 식이섬유 함유
- 기능성 내용: 배변활동 원활
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 폴리덱스트로스은(는) 식이섬유 함유 기준과 관련되며, 기능성 내용은 배변활동 원활이다.

### 원료 32. 호로파종자

- chunk_id: hff_functionality_ad_2009_material_032
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 호로파종자
- 제조기준 요약: 식이섬유 함유
- 기능성 내용: 식후 혈당상승 억제
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 호로파종자은(는) 식이섬유 함유 기준과 관련되며, 기능성 내용은 식후 혈당상승 억제이다.

### 원료 33. 알로에겔

- chunk_id: hff_functionality_ad_2009_material_033
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 알로에겔
- 제조기준 요약: 총 다당체 함유
- 기능성 내용: 피부 건강에 도움, 장 건강에 도움, 면역력 증진
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 알로에겔은(는) 총 다당체 함유 기준과 관련되며, 기능성 내용은 피부 건강에 도움, 장 건강에 도움, 면역력 증진이다.

### 원료 34. 영지버섯 자실체추출물

- chunk_id: hff_functionality_ad_2009_material_034
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 영지버섯 자실체추출물
- 제조기준 요약: 베타글루칸 함유
- 기능성 내용: 혈행 개선
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 영지버섯 자실체추출물은(는) 베타글루칸 함유 기준과 관련되며, 기능성 내용은 혈행 개선이다.

### 원료 35. 키토산/키토올리고당

- chunk_id: hff_functionality_ad_2009_material_035
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 키토산/키토올리고당
- 제조기준 요약: 키토산 또는 키토올리고당 함유
- 기능성 내용: 콜레스테롤 개선
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 키토산/키토올리고당은(는) 키토산 또는 키토올리고당 함유 기준과 관련되며, 기능성 내용은 콜레스테롤 개선이다.

### 원료 36. 프락토올리고당

- chunk_id: hff_functionality_ad_2009_material_036
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 프락토올리고당
- 제조기준 요약: 프락토올리고당 함유
- 기능성 내용: 유익균 증식, 유해균 억제, 배변활동 원활, 칼슘 흡수에 도움
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 프락토올리고당은(는) 프락토올리고당 함유 기준과 관련되며, 기능성 내용은 유익균 증식, 유해균 억제, 배변활동 원활, 칼슘 흡수에 도움이다.

### 원료 37. 프로바이오틱스

- chunk_id: hff_functionality_ad_2009_material_037
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 프로바이오틱스
- 제조기준 요약: 생균 함유
- 기능성 내용: 유익한 유산균 증식, 유해균 억제 또는 배변활동 원활
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 프로바이오틱스은(는) 생균 함유 기준과 관련되며, 기능성 내용은 유익한 유산균 증식, 유해균 억제 또는 배변활동 원활이다.

### 원료 38. 홍국

- chunk_id: hff_functionality_ad_2009_material_038
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 홍국
- 제조기준 요약: 총 모나콜린 K 함유
- 기능성 내용: 콜레스테롤 개선
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 홍국은(는) 총 모나콜린 K 함유 기준과 관련되며, 기능성 내용은 콜레스테롤 개선이다.

### 원료 39. 대두단백

- chunk_id: hff_functionality_ad_2009_material_039
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 대두단백
- 제조기준 요약: 조단백질 및 지표성분 확인
- 기능성 내용: 콜레스테롤 개선
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 대두단백은(는) 조단백질 및 지표성분 확인 기준과 관련되며, 기능성 내용은 콜레스테롤 개선이다.

### 원료 40. 로얄젤리

- chunk_id: hff_functionality_ad_2009_material_040
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 로얄젤리
- 제조기준 요약: 10-HDA 함유
- 기능성 내용: 영양 보급, 건강 증진 및 유지, 고단백 식품
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 로얄젤리은(는) 10-HDA 함유 기준과 관련되며, 기능성 내용은 영양 보급, 건강 증진 및 유지, 고단백 식품이다.

### 원료 41. 버섯

- chunk_id: hff_functionality_ad_2009_material_041
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 버섯
- 제조기준 요약: 자실체 또는 균사체 함량 기준 충족
- 기능성 내용: 생리활성물질 함유, 건강 증진 및 유지
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 버섯은(는) 자실체 또는 균사체 함량 기준 충족 기준과 관련되며, 기능성 내용은 생리활성물질 함유, 건강 증진 및 유지이다.

### 원료 42. 식물추출물발효

- chunk_id: hff_functionality_ad_2009_material_042
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 식물추출물발효
- 제조기준 요약: 유기산도 및 관련 성분 기준 충족
- 기능성 내용: 건강 증진 및 유지, 체질 개선, 영양공급원
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 식물추출물발효은(는) 유기산도 및 관련 성분 기준 충족 기준과 관련되며, 기능성 내용은 건강 증진 및 유지, 체질 개선, 영양공급원이다.

### 원료 43. 자라

- chunk_id: hff_functionality_ad_2009_material_043
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 자라
- 제조기준 요약: 히드록시프롤린 함유
- 기능성 내용: 건강 증진 및 유지, 영양 보급, 단백질 공급원, 신체기능 활성화, 체력 증진, 체력 보강
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 자라은(는) 히드록시프롤린 함유 기준과 관련되며, 기능성 내용은 건강 증진 및 유지, 영양 보급, 단백질 공급원, 신체기능 활성화, 체력 증진, 체력 보강이다.

### 원료 44. 효모

- chunk_id: hff_functionality_ad_2009_material_044
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 효모
- 제조기준 요약: 조단백질 기준 충족
- 기능성 내용: 영양의 불균형 개선, 영양공급원, 건강 증진 및 유지, 신진대사 기능
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 효모은(는) 조단백질 기준 충족 기준과 관련되며, 기능성 내용은 영양의 불균형 개선, 영양공급원, 건강 증진 및 유지, 신진대사 기능이다.

### 원료 45. 효소

- chunk_id: hff_functionality_ad_2009_material_045
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 효소
- 제조기준 요약: 조단백질 및 효소 활성 기준 충족
- 기능성 내용: 신진대사 기능, 건강 증진 및 유지, 체질 개선
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 효소은(는) 조단백질 및 효소 활성 기준 충족 기준과 관련되며, 기능성 내용은 신진대사 기능, 건강 증진 및 유지, 체질 개선이다.

### 원료 46. 화분

- chunk_id: hff_functionality_ad_2009_material_046
- source_type: ingredient_functionality
- domain: health_functional_food_ad
- 원료/품목: 화분
- 제조기준 요약: 조단백질 기준 충족
- 기능성 내용: 영양 보급, 피부 건강에 도움, 건강 증진 및 유지, 신진대사 기능
- RAG 검색용 요약: 건강기능식품 원료 또는 품목인 화분은(는) 조단백질 기준 충족 기준과 관련되며, 기능성 내용은 영양 보급, 피부 건강에 도움, 건강 증진 및 유지, 신진대사 기능이다.

## 4. 기능성 내용별 원료 매핑

- 설명: 사용자가 특정 기능성 표현을 질문했을 때 관련 원료를 찾기 위한 매핑이다.
- 청킹 권장: 기능성 내용 1개를 하나의 청크로 임베딩한다.

### 기능성 1. 혈중지질 조절

- chunk_id: hff_functionality_ad_2009_function_map_001
- source_type: functionality_material_map
- domain: health_functional_food_ad
- 기능성 내용: 혈중지질 조절
- 관련 원료: 오메가-3 지방산 함유 유지, 감마리놀렌산 함유 유지, 레시틴, 식물스테롤/식물스테롤에스테르, 구아검/구아검가수분해물, 글루코만난, 귀리 식이섬유, 대두 식이섬유, 옥수수겨 식이섬유, 이눌린/치커리추출물, 차전자피, 키토산/키토올리고당, 홍국, 대두단백
- RAG 검색용 요약: 건강기능식품 기능성 내용인 혈중지질 조절와 관련된 원료에는 오메가-3 지방산 함유 유지, 감마리놀렌산 함유 유지, 레시틴, 식물스테롤/식물스테롤에스테르, 구아검/구아검가수분해물, 글루코만난, 귀리 식이섬유, 대두 식이섬유, 옥수수겨 식이섬유, 이눌린/치커리추출물, 차전자피, 키토산/키토올리고당, 홍국, 대두단백 등이 있다.

### 기능성 2. 혈행 개선

- chunk_id: hff_functionality_ad_2009_function_map_002
- source_type: functionality_material_map
- domain: health_functional_food_ad
- 기능성 내용: 혈행 개선
- 관련 원료: 홍삼, 오메가-3 지방산 함유 유지, 감마리놀렌산 함유 유지, 영지버섯 자실체추출물
- RAG 검색용 요약: 건강기능식품 기능성 내용인 혈행 개선와 관련된 원료에는 홍삼, 오메가-3 지방산 함유 유지, 감마리놀렌산 함유 유지, 영지버섯 자실체추출물 등이 있다.

### 기능성 3. 관절 및 연골 건강

- chunk_id: hff_functionality_ad_2009_function_map_003
- source_type: functionality_material_map
- domain: health_functional_food_ad
- 기능성 내용: 관절 및 연골 건강
- 관련 원료: 글루코사민, N-아세틸글루코사민, 뮤코다당·단백
- RAG 검색용 요약: 건강기능식품 기능성 내용인 관절 및 연골 건강와 관련된 원료에는 글루코사민, N-아세틸글루코사민, 뮤코다당·단백 등이 있다.

### 기능성 4. 혈당 조정

- chunk_id: hff_functionality_ad_2009_function_map_004
- source_type: functionality_material_map
- domain: health_functional_food_ad
- 기능성 내용: 혈당 조정
- 관련 원료: 구아검/구아검가수분해물, 귀리 식이섬유, 난소화성 말토덱스트린, 대두 식이섬유, 밀 식이섬유, 옥수수겨 식이섬유, 이눌린/치커리추출물, 호로파종자
- RAG 검색용 요약: 건강기능식품 기능성 내용인 혈당 조정와 관련된 원료에는 구아검/구아검가수분해물, 귀리 식이섬유, 난소화성 말토덱스트린, 대두 식이섬유, 밀 식이섬유, 옥수수겨 식이섬유, 이눌린/치커리추출물, 호로파종자 등이 있다.

### 기능성 5. 배변활동

- chunk_id: hff_functionality_ad_2009_function_map_005
- source_type: functionality_material_map
- domain: health_functional_food_ad
- 기능성 내용: 배변활동
- 관련 원료: 알로에 전잎, 구아검/구아검가수분해물, 글루코만난, 난소화성 말토덱스트린, 대두 식이섬유, 목이버섯 식이섬유, 밀 식이섬유, 보리 식이섬유, 아라비아검/아카시아검, 이눌린/치커리추출물, 차전자피, 폴리덱스트로스, 프락토올리고당, 프로바이오틱스
- RAG 검색용 요약: 건강기능식품 기능성 내용인 배변활동와 관련된 원료에는 알로에 전잎, 구아검/구아검가수분해물, 글루코만난, 난소화성 말토덱스트린, 대두 식이섬유, 목이버섯 식이섬유, 밀 식이섬유, 보리 식이섬유, 아라비아검/아카시아검, 이눌린/치커리추출물, 차전자피, 폴리덱스트로스, 프락토올리고당, 프로바이오틱스 등이 있다.

### 기능성 6. 장내 유익균 증식 및 유해균 억제

- chunk_id: hff_functionality_ad_2009_function_map_006
- source_type: functionality_material_map
- domain: health_functional_food_ad
- 기능성 내용: 장내 유익균 증식 및 유해균 억제
- 관련 원료: 프락토올리고당, 프로바이오틱스
- RAG 검색용 요약: 건강기능식품 기능성 내용인 장내 유익균 증식 및 유해균 억제와 관련된 원료에는 프락토올리고당, 프로바이오틱스 등이 있다.

### 기능성 7. 면역력/신체저항능력

- chunk_id: hff_functionality_ad_2009_function_map_007
- source_type: functionality_material_map
- domain: health_functional_food_ad
- 기능성 내용: 면역력/신체저항능력
- 관련 원료: 인삼, 홍삼, 알콕시글리세롤 함유 상어간유, 알로에겔
- RAG 검색용 요약: 건강기능식품 기능성 내용인 면역력/신체저항능력와 관련된 원료에는 인삼, 홍삼, 알콕시글리세롤 함유 상어간유, 알로에겔 등이 있다.

### 기능성 8. 항산화 작용

- chunk_id: hff_functionality_ad_2009_function_map_008
- source_type: functionality_material_map
- domain: health_functional_food_ad
- 기능성 내용: 항산화 작용
- 관련 원료: 엽록소 함유 식물, 스피루리나/클로렐라, 녹차추출물, 프로폴리스추출물, 스쿠알렌
- RAG 검색용 요약: 건강기능식품 기능성 내용인 항산화 작용와 관련된 원료에는 엽록소 함유 식물, 스피루리나/클로렐라, 녹차추출물, 프로폴리스추출물, 스쿠알렌 등이 있다.

### 기능성 9. 피부 건강

- chunk_id: hff_functionality_ad_2009_function_map_009
- source_type: functionality_material_map
- domain: health_functional_food_ad
- 기능성 내용: 피부 건강
- 관련 원료: 엽록소 함유 식물, 스피루리나/클로렐라, 알로에겔, N-아세틸글루코사민
- RAG 검색용 요약: 건강기능식품 기능성 내용인 피부 건강와 관련된 원료에는 엽록소 함유 식물, 스피루리나/클로렐라, 알로에겔, N-아세틸글루코사민 등이 있다.

### 기능성 10. 피로 회복

- chunk_id: hff_functionality_ad_2009_function_map_010
- source_type: functionality_material_map
- domain: health_functional_food_ad
- 기능성 내용: 피로 회복
- 관련 원료: 인삼, 홍삼, 매실추출물
- RAG 검색용 요약: 건강기능식품 기능성 내용인 피로 회복와 관련된 원료에는 인삼, 홍삼, 매실추출물 등이 있다.

### 기능성 11. 지구력 증진/운동수행능력 증진

- chunk_id: hff_functionality_ad_2009_function_map_011
- source_type: functionality_material_map
- domain: health_functional_food_ad
- 기능성 내용: 지구력 증진/운동수행능력 증진
- 관련 원료: 옥타코사놀 함유 유지
- RAG 검색용 요약: 건강기능식품 기능성 내용인 지구력 증진/운동수행능력 증진와 관련된 원료에는 옥타코사놀 함유 유지 등이 있다.

### 기능성 12. 구강 내 항균 작용

- chunk_id: hff_functionality_ad_2009_function_map_012
- source_type: functionality_material_map
- domain: health_functional_food_ad
- 기능성 내용: 구강 내 항균 작용
- 관련 원료: 프로폴리스추출물
- RAG 검색용 요약: 건강기능식품 기능성 내용인 구강 내 항균 작용와 관련된 원료에는 프로폴리스추출물 등이 있다.

### 기능성 13. 장 건강

- chunk_id: hff_functionality_ad_2009_function_map_013
- source_type: functionality_material_map
- domain: health_functional_food_ad
- 기능성 내용: 장 건강
- 관련 원료: 알로에겔
- RAG 검색용 요약: 건강기능식품 기능성 내용인 장 건강와 관련된 원료에는 알로에겔 등이 있다.

### 기능성 14. 칼슘 흡수에 도움

- chunk_id: hff_functionality_ad_2009_function_map_014
- source_type: functionality_material_map
- domain: health_functional_food_ad
- 기능성 내용: 칼슘 흡수에 도움
- 관련 원료: 프락토올리고당
- RAG 검색용 요약: 건강기능식품 기능성 내용인 칼슘 흡수에 도움와 관련된 원료에는 프락토올리고당 등이 있다.

## 5. 광고 문구 판별용 요약 규칙

### 질병 치료·예방 오인 표현
- RAG 검색용 요약: 건강기능식품 광고에서 의약품이나 질병 치료 효과가 있는 것으로 오인될 우려가 있는 표현은 사용할 수 없다.
- 예시 판단: 고혈압 치료, 당뇨 개선, 아토피 치료, 암 예방처럼 질병명과 치료·예방·개선 효과가 결합된 표현은 주의가 필요하다.

### 인정된 기능성 범위 초과 표현
- RAG 검색용 요약: 제품 또는 주원료에 대해 인정된 기능성 내용 범위를 넘어서는 표현은 허위·과대 또는 소비자 오인 표현이 될 수 있다.
- 예시 판단: 부원료 특허, 일반 논문, 언론 보도 등을 근거로 주원료 기능성을 확장해 표현하는 것은 주의가 필요하다.

### 체험담·추천·보증 표현
- RAG 검색용 요약: 소비자 체험담, 전문가 추천, 수상·인증 표현은 객관적 사실과 인정된 기능성 범위 안에서만 사용할 수 있으며, 질병 치료나 단정적 효과를 암시하면 사용할 수 없다.

### 비교·우수성 표현
- RAG 검색용 요약: 비교 표시·광고는 비교대상, 비교기준, 비교내용, 비교방법이 명확해야 하며 객관적 실증자료에 근거해야 한다.
