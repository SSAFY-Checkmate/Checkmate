# 부당한 표시 또는 광고로 보지 아니하는 식품등의 기능성 표시 또는 광고에 관한 규정 - RAG Ready

## 문서 메타데이터
- 문서명: 부당한 표시 또는 광고로 보지 아니하는 식품등의 기능성 표시 또는 광고에 관한 규정
- 고시: 식품의약품안전처고시 제2024-62호
- 개정일: 2024. 10. 17. 일부개정
- 시행일: 2025. 1. 1.
- 문서유형: 일반식품 기능성 표시·광고 인정 범위 및 요건 고시
- 핵심 용도: 식품등의 기능성 표시·광고가 부당한 표시 또는 광고로 보지 않는 범위와 요건 확인
- 전처리 기준: 조문별 규칙 청크, 제외 대상 청크, 기능성 범위 청크, 제품 요건 청크, 표시 필수사항 청크, 공개자료 청크, 별표 행 단위 청크

## 청킹 기준

- 조문 규칙: 조문 또는 항 단위로 청크화
- 적용 제외 대상: 제외 사유 1개 = 청크 1개
- 기능성 범위: 허용 범위 또는 제외 범위 1개 = 청크 1개
- 식품등 요건: 요건 1개 = 청크 1개
- 표시 방법: 기능성 유형별 필수 표시사항을 하나의 청크로 묶기
- 별표 1 공통 영양성분 기준: 영양성분 1개 = 청크 1개
- 별표 1 개별기준: 원재료·기능성 조합 1개 = 청크 1개
- 별표 2: 원재료·기능성 조합 1개 = 청크 1개
- 임베딩 권장 필드: RAG 검색용 요약, 판단 기준, 적용 대상, 제외 대상, 필수 표시사항, 기준값

## 제1조(목적)

- chunk_id: functional_food_general_claim_2024_62_purpose
- source_type: legal_purpose
- domain: general_food_functionality_ad
- RAG 검색용 요약: 이 고시는 식품등에 함유된 영양성분이나 원재료가 신체조직과 기능의 증진에 도움을 줄 수 있다는 내용이 부당한 표시 또는 광고로 보지 않는 표시·광고가 되기 위한 범위와 요건을 정한 기준이다.
- 관련 근거: 식품 등의 표시·광고에 관한 법률 제8조, 같은 법 시행령 제3조제1항 별표 1 제3호나목

## 제2조(정의)

### 정의 1. 원재료
- chunk_id: functional_food_general_claim_2024_62_definition_01
- source_type: legal_definition
- domain: general_food_functionality_ad
- 용어: 원재료
- 정의: 식품, 축산물, 식품첨가물의 제조·가공에 사용되는 물질로서 최종 제품 내에 들어 있는 것
- RAG 검색용 요약: 이 고시에서 “원재료”은 식품, 축산물, 식품첨가물의 제조·가공에 사용되는 물질로서 최종 제품 내에 들어 있는 것을 의미한다.

### 정의 2. 성분
- chunk_id: functional_food_general_claim_2024_62_definition_02
- source_type: legal_definition
- domain: general_food_functionality_ad
- 용어: 성분
- 정의: 제품에 따로 첨가한 영양성분 또는 비영양성분이거나 원재료를 구성하는 단일물질로서 최종 제품에 함유되어 있는 것
- RAG 검색용 요약: 이 고시에서 “성분”은 제품에 따로 첨가한 영양성분 또는 비영양성분이거나 원재료를 구성하는 단일물질로서 최종 제품에 함유되어 있는 것을 의미한다.

### 정의 3. 1일 섭취기준량
- chunk_id: functional_food_general_claim_2024_62_definition_03
- source_type: legal_definition
- domain: general_food_functionality_ad
- 용어: 1일 섭취기준량
- 정의: 건강기능식품 최종 제품 요건을 위한 일일섭취량 또는 기능성을 나타내기 위한 원재료 또는 성분의 하루 최소 섭취량
- RAG 검색용 요약: 이 고시에서 “1일 섭취기준량”은 건강기능식품 최종 제품 요건을 위한 일일섭취량 또는 기능성을 나타내기 위한 원재료 또는 성분의 하루 최소 섭취량을 의미한다.

## 제3조(적용범위)

### 적용 대상
- chunk_id: functional_food_general_claim_2024_62_scope_applicable
- source_type: legal_scope
- domain: general_food_functionality_ad
- RAG 검색용 요약: 이 고시는 부당한 표시 또는 광고로 보지 아니하는 ‘신체조직과 기능의 증진에 도움을 줄 수 있다는 내용’을 표시 또는 광고하려는 식품등에 적용한다.

### 적용 제외 대상

#### 제외 대상 1. 주류 및 특수의료용도등식품
- chunk_id: functional_food_general_claim_2024_62_exclusion_01
- source_type: legal_exclusion
- domain: general_food_functionality_ad
- 제외 대상: 주류 및 특수의료용도등식품
- 판단 기준: 식품의 기준 및 규격에서 정한 주류 및 특수의료용도등식품은 이 고시 적용 대상에서 제외된다.
- RAG 검색용 요약: 식품의 기준 및 규격에서 정한 주류 및 특수의료용도등식품은 이 고시 적용 대상에서 제외된다.

#### 제외 대상 2. 영양성분 함량 기준 미충족 식품등
- chunk_id: functional_food_general_claim_2024_62_exclusion_02
- source_type: legal_exclusion
- domain: general_food_functionality_ad
- 제외 대상: 영양성분 함량 기준 미충족 식품등
- 판단 기준: 별표 1의 영양성분 함량 기준에 적합하지 않은 식품등은 제외된다.
- RAG 검색용 요약: 별표 1의 영양성분 함량 기준에 적합하지 않은 식품등은 제외된다.

#### 제외 대상 3. 36개월 이하 영유아 및 아동 대상 식품등
- chunk_id: functional_food_general_claim_2024_62_exclusion_03
- source_type: legal_exclusion
- domain: general_food_functionality_ad
- 제외 대상: 36개월 이하 영유아 및 아동 대상 식품등
- 판단 기준: 36개월 이하 영유아를 섭취대상으로 하는 식품등, 또는 어린이·아동 및 유사 표현이나 이미지를 사용하여 아동이 섭취하는 것으로 표시·광고한 식품등은 제외된다. 다만, 어린이 식생활안전관리 특별법 제14조제1항에 따라 품질인증을 받은 어린이 기호식품은 제외 대상에서 다시 제외된다.
- RAG 검색용 요약: 36개월 이하 영유아를 섭취대상으로 하는 식품등, 또는 어린이·아동 및 유사 표현이나 이미지를 사용하여 아동이 섭취하는 것으로 표시·광고한 식품등은 제외된다. 다만, 어린이 식생활안전관리 특별법 제14조제1항에 따라 품질인증을 받은 어린이 기호식품은 제외 대상에서 다시 제외된다.

#### 제외 대상 4. 임산부 또는 수유부 대상 식품등
- chunk_id: functional_food_general_claim_2024_62_exclusion_04
- source_type: legal_exclusion
- domain: general_food_functionality_ad
- 제외 대상: 임산부 또는 수유부 대상 식품등
- 판단 기준: 임산부 또는 수유 중인 여성을 대상으로 한 식품등은 제외되며, 임신 계획용 표방 식품등도 포함된다.
- RAG 검색용 요약: 임산부 또는 수유 중인 여성을 대상으로 한 식품등은 제외되며, 임신 계획용 표방 식품등도 포함된다.

#### 제외 대상 5. 특정 제형 식품등
- chunk_id: functional_food_general_claim_2024_62_exclusion_05
- source_type: legal_exclusion
- domain: general_food_functionality_ad
- 제외 대상: 특정 제형 식품등
- 판단 기준: 정제, 캡슐, 바로 섭취하는 스틱·포 형태의 과립 또는 분말, 스프레이형·앰플형 및 유사 액상, 인삼·홍삼 기능성을 나타낸 농축액·100mL 이하 파우치 형태의 액상 식품등은 제외된다.
- RAG 검색용 요약: 정제, 캡슐, 바로 섭취하는 스틱·포 형태의 과립 또는 분말, 스프레이형·앰플형 및 유사 액상, 인삼·홍삼 기능성을 나타낸 농축액·100mL 이하 파우치 형태의 액상 식품등은 제외된다.

## 제4조(기능성의 범위)

### 기능성에 해당하는 범위

#### 기능성 범위 1. 고시형 기능성 원료
- chunk_id: functional_food_general_claim_2024_62_allowed_functionality_01
- source_type: allowed_functionality_scope
- domain: general_food_functionality_ad
- 범위: 고시형 기능성 원료
- 판단 기준: 건강기능식품의 기준 및 규격에서 기능성 원료로 정해진 것 중 별표 2 제1호에 해당하는 기능성
- RAG 검색용 요약: 일반식품 기능성 표시·광고에서 건강기능식품의 기준 및 규격에서 기능성 원료로 정해진 것 중 별표 2 제1호에 해당하는 기능성은 기능성 범위에 포함될 수 있다.

#### 기능성 범위 2. 인정받은 원재료 기능성
- chunk_id: functional_food_general_claim_2024_62_allowed_functionality_02
- source_type: allowed_functionality_scope
- domain: general_food_functionality_ad
- 범위: 인정받은 원재료 기능성
- 판단 기준: 건강기능식품 기능성 원료 및 기준·규격 인정에 관한 규정 제10조제1항에 따라 인정받은 기능성 원료의 제조자 또는 수입자가 식품의약품안전처장에게 신청하여 별표 2 제2호의 의사결정도에 따라 인정받은 원재료의 기능성
- RAG 검색용 요약: 일반식품 기능성 표시·광고에서 건강기능식품 기능성 원료 및 기준·규격 인정에 관한 규정 제10조제1항에 따라 인정받은 기능성 원료의 제조자 또는 수입자가 식품의약품안전처장에게 신청하여 별표 2 제2호의 의사결정도에 따라 인정받은 원재료의 기능성은 기능성 범위에 포함될 수 있다.

#### 기능성 범위 3. 실증자료 기반 기능성
- chunk_id: functional_food_general_claim_2024_62_allowed_functionality_03
- source_type: allowed_functionality_scope
- domain: general_food_functionality_ad
- 범위: 실증자료 기반 기능성
- 판단 기준: 식품등의 표시 또는 광고 실증에 관한 규정 제4조제3호 중 인체적용시험 또는 인체적용시험 결과에 대한 정성적 문헌고찰을 통해 과학적 자료를 갖춘 기능성
- RAG 검색용 요약: 일반식품 기능성 표시·광고에서 식품등의 표시 또는 광고 실증에 관한 규정 제4조제3호 중 인체적용시험 또는 인체적용시험 결과에 대한 정성적 문헌고찰을 통해 과학적 자료를 갖춘 기능성은 기능성 범위에 포함될 수 있다.

### 기능성에 해당하지 않는 사항

#### 비해당 기능성 1. 건강민감 계층 관련 내용
- chunk_id: functional_food_general_claim_2024_62_not_functionality_01
- source_type: excluded_functionality_scope
- domain: general_food_functionality_ad
- 제외 범위: 건강민감 계층 관련 내용
- 판단 기준: 어린이, 임산·수유부, 노인 등 건강민감 계층과 관련된 내용은 기능성에 해당하지 않는다. 예: 수험생 기억력 개선, 어린이 키성장, 노인 인지능력 개선
- RAG 검색용 요약: 어린이, 임산·수유부, 노인 등 건강민감 계층과 관련된 내용은 기능성에 해당하지 않는다. 예: 수험생 기억력 개선, 어린이 키성장, 노인 인지능력 개선

#### 비해당 기능성 2. 성기능 또는 생식기 건강 관련 내용
- chunk_id: functional_food_general_claim_2024_62_not_functionality_02
- source_type: excluded_functionality_scope
- domain: general_food_functionality_ad
- 제외 범위: 성기능 또는 생식기 건강 관련 내용
- 판단 기준: 남성 또는 여성의 성기능이나 생식기 건강과 관련된 내용은 기능성에 해당하지 않는다. 예: 정자운동성, 질건강
- RAG 검색용 요약: 남성 또는 여성의 성기능이나 생식기 건강과 관련된 내용은 기능성에 해당하지 않는다. 예: 정자운동성, 질건강

#### 비해당 기능성 3. 질병발생 위험 감소 기능
- chunk_id: functional_food_general_claim_2024_62_not_functionality_03
- source_type: excluded_functionality_scope
- domain: general_food_functionality_ad
- 제외 범위: 질병발생 위험 감소 기능
- 판단 기준: 건강기능식품의 기준 및 규격의 질병발생 위험 감소 기능과 건강기능식품 기능성 원료 및 기준·규격 인정에 관한 규정 별표 4의 질병발생 위험 감소 기능은 이 고시의 기능성에 해당하지 않는다.
- RAG 검색용 요약: 건강기능식품의 기준 및 규격의 질병발생 위험 감소 기능과 건강기능식품 기능성 원료 및 기준·규격 인정에 관한 규정 별표 4의 질병발생 위험 감소 기능은 이 고시의 기능성에 해당하지 않는다.

## 제5조(식품등의 요건)

### 식품등 요건 1. 제조·가공 업소 요건
- chunk_id: functional_food_general_claim_2024_62_requirement_haccp_manufacturing
- source_type: product_requirement
- domain: general_food_functionality_ad
- RAG 검색용 요약: 기능성 표시 또는 광고를 할 수 있는 식품등은 식품안전관리인증기준적용업소 또는 축산물 안전관리인증업소에서 제조·가공되어야 한다. 수입식품등은 예외다.
- 관련 근거/참고: 식품위생법 제48조제3항, 축산물 위생관리법 제9조제3항, 수입식품안전관리 특별법 제2조

### 식품등 요건 2. 제4조제1항제1호·제2호 기능성 원재료 또는 성분 함량 요건
- chunk_id: functional_food_general_claim_2024_62_requirement_ingredient_amount_30_percent
- source_type: product_requirement
- domain: general_food_functionality_ad
- RAG 검색용 요약: 기능성을 나타내는 원재료 또는 성분의 함량은 1일 섭취기준량의 30% 이상을 충족하고 최대함량기준을 초과하지 않아야 한다. 1일 섭취기준량 적용은 1회 섭취참고량을 기준으로 한다.
- 관련 근거/참고: 별표 2 제1호, 식품등의 표시기준

### 식품등 요건 3. 기능성 원재료 또는 성분 제조·가공 요건
- chunk_id: functional_food_general_claim_2024_62_requirement_gmp_ingredient
- source_type: product_requirement
- domain: general_food_functionality_ad
- RAG 검색용 요약: 제4조제1항제1호 및 제2호 기능성 표시·광고에 쓰이는 기능성 원재료 또는 성분은 우수건강기능식품제조기준적용업소에서 제조·가공된 것이어야 한다. 수입식품등은 예외다.
- 관련 근거/참고: 건강기능식품에 관한 법률 제4조, 건강기능식품에 관한 법률 제22조

### 식품등 요건 4. 제4조제1항제3호 기능성 원재료 또는 성분 함량 요건
- chunk_id: functional_food_general_claim_2024_62_requirement_substantiated_functionality_amount
- source_type: product_requirement
- domain: general_food_functionality_ad
- RAG 검색용 요약: 실증자료 기반 기능성의 경우 기능성을 나타내는 원재료 또는 성분의 함량은 실증된 함량을 충족하거나, 실증된 최종제품의 원재료 또는 성분 배합비율과 동일하게 제조되어야 한다.
- 관련 근거/참고: 제4조제1항제3호

### 식품등 요건 5. 기능성 성분 표시량 기준
- chunk_id: functional_food_general_claim_2024_62_requirement_label_amount_test_standard
- source_type: product_requirement
- domain: general_food_functionality_ad
- RAG 검색용 요약: 기능성을 나타내는 원재료 또는 성분을 사용한 식품등은 건강기능식품 기준 및 규격 또는 기능성 원료 인정 규정의 표시량 기준에 적합해야 한다. 제4조제1항제3호의 경우 실제 측정값은 표시량의 80% 이상이어야 한다.
- 관련 근거/참고: 건강기능식품의 기준 및 규격, 건강기능식품 기능성 원료 및 기준·규격 인정에 관한 규정, 식품등의 표시 또는 광고 실증에 관한 규정

### 식품등 요건 6. 소비기한까지 함량 유지 및 6개월 주기 확인
- chunk_id: functional_food_general_claim_2024_62_requirement_shelf_life_maintenance
- source_type: product_requirement
- domain: general_food_functionality_ad
- RAG 검색용 요약: 식품등에 함유된 기능성을 나타내는 원재료 또는 성분의 함량은 소비기한까지 유지되어야 하며, 제조일 또는 수입일 기준으로 매 6개월마다 기준 적합성을 확인해야 한다.
- 관련 근거/참고: 제5조제5항

## 제5조의2(기준의 적용)

- chunk_id: functional_food_general_claim_2024_62_priority_changed_standards
- source_type: standard_application_rule
- domain: general_food_functionality_ad
- RAG 검색용 요약: 이 고시와 관련된 기준 및 규격이 건강기능식품의 기준 및 규격 또는 식품등의 표시기준에서 변경된 경우, 변경된 사항을 우선 적용한다.

## 제6조(표시 또는 광고의 방법)

### 제4조제1항제1호 및 제2호 기능성 표시 필수사항
- chunk_id: functional_food_general_claim_2024_62_label_method_type_1_2
- source_type: label_required_items
- domain: general_food_functionality_ad
- 적용 대상: 제4조제1항제1호 및 제2호에 따른 기능성을 표시하려는 식품등
- RAG 검색용 요약: 제4조제1항제1호 및 제2호 기능성을 표시하려는 식품등은 기능성 원재료 또는 성분 포함 내용, 기능성 성분 함량, 1일 섭취기준량, 섭취 시 주의사항, 건강기능식품이 아니라는 문구, 질병 예방·치료용 제품이 아니라는 문구, 균형 잡힌 식생활 권장 문구, 이상사례 상담 문구를 포함해야 한다.
- 필수 표시사항:
  - 기능성에 도움을 줄 수 있다고 알려진 또는 보고된 기능성 원재료 또는 성분이 식품등에 들어 있다는 내용
  - 기능성 성분 함량
  - 1일 섭취기준량
  - 섭취 시 주의사항
  - “본 제품은 건강기능식품이 아닙니다.”라는 문구
  - 질병의 예방·치료를 위한 제품이 아니라는 문구
  - 균형 잡힌 식생활을 권장하는 문구
  - 이상사례가 있는 경우 섭취를 중지하고 전문가와 상담이 필요하다는 문구

### 제4조제1항제3호 기능성 표시 필수사항
- chunk_id: functional_food_general_claim_2024_62_label_method_type_3
- source_type: label_required_items
- domain: general_food_functionality_ad
- 적용 대상: 제4조제1항제3호에 따른 기능성을 표시하려는 식품등
- RAG 검색용 요약: 제4조제1항제3호 기능성을 표시하려는 식품등은 기능성 내용, 기능성 성분 함량, 1일 섭취기준량, 건강기능식품이 아니라는 문구, 질병 예방·치료용 제품이 아니라는 문구, 이상사례 상담 문구를 포함해야 하며, 숙취해소 기능성의 경우 “과도한 음주는 건강을 해칩니다.” 문구를 포함해야 한다.
- 필수 표시사항:
  - 제4조제1항제3호에 해당하는 기능성 내용
  - 기능성 성분 함량. 단, 최종제품으로 실증한 경우 제외
  - 1일 섭취기준량
  - “과도한 음주는 건강을 해칩니다.”라는 문구. 숙취해소 관련 기능성 표시의 경우에만 해당
  - “본 제품은 건강기능식품이 아닙니다.”라는 문구
  - 질병의 예방·치료를 위한 제품이 아니라는 문구
  - 이상사례가 있는 경우 섭취를 중지하고 전문가와 상담이 필요하다는 문구

### 기능성 광고 가능 조건
- chunk_id: functional_food_general_claim_2024_62_ad_condition
- source_type: ad_condition
- domain: general_food_functionality_ad
- RAG 검색용 요약: 기능성 광고는 제6조제1항 또는 제2항에 따른 표시가 있는 식품등에 한해 가능하며, 광고에는 “본 제품은 건강기능식품이 아닙니다.”라는 문구를 포함해야 한다.

## 제7조(자료 공개 등)

- chunk_id: functional_food_general_claim_2024_62_public_disclosure
- source_type: public_disclosure_requirement
- domain: general_food_functionality_ad
- RAG 검색용 요약: 기능성 표시 또는 광고를 하려는 영업자는 한국식품산업협회 인터넷 홈페이지에 제품명, 업소명, 기능성 성분명과 함량, 1일 섭취기준량 관련 비율, 기능성 표시 내용, 과학적 근거자료를 공개해야 한다.
- 공개 자료:
  - 제품명
  - 업소명
  - 기능성 성분명과 그 함량
  - 1일 섭취기준량 및 기능성 성분 함량의 1일 섭취기준량에 대한 비율. 단, 제6조제2항에 따른 경우는 제외
  - 기능성 표시 내용
  - 과학적 근거자료

## 제8조(재검토 기한)

- chunk_id: functional_food_general_claim_2024_62_review_period
- source_type: legal_review_period
- domain: general_food_functionality_ad
- RAG 검색용 요약: 식품의약품안전처장은 2021년 1월 1일을 기준으로 매 3년마다 이 고시의 타당성을 검토하고 개선 등의 조치를 해야 한다.
- 기한/기간: 매 3년

## 부칙 <제2024-62호, 2024. 10. 17.>

### 시행일
- chunk_id: functional_food_general_claim_2024_62_addendum_effective_date
- source_type: legal_addendum
- RAG 검색용 요약: 이 고시는 2025년 1월 1일부터 시행한다. 다만, 별표 1의 제2호나목은 고시한 날부터 시행한다.

### 적용례
- chunk_id: functional_food_general_claim_2024_62_addendum_application
- source_type: legal_addendum
- RAG 검색용 요약: 이 고시는 시행 후 최초로 제조·가공 또는 수입한 식품부터 적용하며, 수입은 선적일 기준이다. 시행 전에 이미 제조·가공 또는 수입된 식품이 이 고시 적용을 원하면 적용할 수 있다.

### 숙취해소 관련 경과조치
- chunk_id: functional_food_general_claim_2024_62_addendum_hangover_transition
- source_type: legal_addendum
- RAG 검색용 요약: 숙취해소 관련 기능성을 표시·광고하는 경우, 시행 당시 종전 규정에 따라 이미 제조·가공 또는 수입된 식품등은 소비기한까지 종전의 표시 또는 광고 방법을 사용할 수 있다.

## 별표 1. 영양성분 함량 기준

### 공통 영양성분 기준

#### 공통기준 1. 총지방
- chunk_id: functional_food_general_claim_2024_62_common_nutrition_01
- source_type: nutrition_common_standard
- domain: general_food_functionality_ad
- 영양성분: 총지방
- 기준값: 일반식품: 10.0 g 이하; 농축과채즙·과채주스: 10.0 g 이하; 김치류·장류: 10.0 g 이하; 식용유지류: -; 소스·마요네즈: -; 우유·가공유: 10.0 g 이하; 치즈: 15.0 g 이하; 초콜릿: -
- RAG 검색용 요약: 기능성 표시·광고 적용을 위한 별표 1 공통기준에서 총지방 기준은 일반식품: 10.0 g 이하; 농축과채즙·과채주스: 10.0 g 이하; 김치류·장류: 10.0 g 이하; 식용유지류: -; 소스·마요네즈: -; 우유·가공유: 10.0 g 이하; 치즈: 15.0 g 이하; 초콜릿: -이다.

#### 공통기준 2. 포화지방
- chunk_id: functional_food_general_claim_2024_62_common_nutrition_02
- source_type: nutrition_common_standard
- domain: general_food_functionality_ad
- 영양성분: 포화지방
- 기준값: 일반식품: 3.0 g 이하; 농축과채즙·과채주스: 3.0 g 이하; 김치류·장류: 3.0 g 이하; 식용유지류: 20.0 g 이하; 소스·마요네즈: 3.0 g 이하; 우유·가공유: 5.0 g 이하; 치즈: 10.0 g 이하; 초콜릿: -
- RAG 검색용 요약: 기능성 표시·광고 적용을 위한 별표 1 공통기준에서 포화지방 기준은 일반식품: 3.0 g 이하; 농축과채즙·과채주스: 3.0 g 이하; 김치류·장류: 3.0 g 이하; 식용유지류: 20.0 g 이하; 소스·마요네즈: 3.0 g 이하; 우유·가공유: 5.0 g 이하; 치즈: 10.0 g 이하; 초콜릿: -이다.

#### 공통기준 3. 트랜스지방
- chunk_id: functional_food_general_claim_2024_62_common_nutrition_03
- source_type: nutrition_common_standard
- domain: general_food_functionality_ad
- 영양성분: 트랜스지방
- 기준값: 일반식품: 0.2 g 이하; 농축과채즙·과채주스: 0.2 g 이하; 김치류·장류: 0.2 g 이하; 식용유지류: 2.0 g 이하; 소스·마요네즈: 0.2 g 이하; 우유·가공유: 0.5 g 이하; 치즈: 0.8 g 이하; 초콜릿: 0.2 g 이하
- RAG 검색용 요약: 기능성 표시·광고 적용을 위한 별표 1 공통기준에서 트랜스지방 기준은 일반식품: 0.2 g 이하; 농축과채즙·과채주스: 0.2 g 이하; 김치류·장류: 0.2 g 이하; 식용유지류: 2.0 g 이하; 소스·마요네즈: 0.2 g 이하; 우유·가공유: 0.5 g 이하; 치즈: 0.8 g 이하; 초콜릿: 0.2 g 이하이다.

#### 공통기준 4. 당류
- chunk_id: functional_food_general_claim_2024_62_common_nutrition_04
- source_type: nutrition_common_standard
- domain: general_food_functionality_ad
- 영양성분: 당류
- 기준값: 일반식품: 20.0 g 이하; 농축과채즙·과채주스: 26.0 g 이하; 김치류·장류: 20.0 g 이하; 식용유지류: 20.0 g 이하; 소스·마요네즈: 20.0 g 이하; 우유·가공유: 20.0 g 이하; 치즈: 20.0 g 이하; 초콜릿: 20.0 g 이하
- RAG 검색용 요약: 기능성 표시·광고 적용을 위한 별표 1 공통기준에서 당류 기준은 일반식품: 20.0 g 이하; 농축과채즙·과채주스: 26.0 g 이하; 김치류·장류: 20.0 g 이하; 식용유지류: 20.0 g 이하; 소스·마요네즈: 20.0 g 이하; 우유·가공유: 20.0 g 이하; 치즈: 20.0 g 이하; 초콜릿: 20.0 g 이하이다.

#### 공통기준 5. 나트륨
- chunk_id: functional_food_general_claim_2024_62_common_nutrition_05
- source_type: nutrition_common_standard
- domain: general_food_functionality_ad
- 영양성분: 나트륨
- 기준값: 일반식품: 400.0 mg 이하; 농축과채즙·과채주스: 400.0 mg 이하; 김치류·장류: -; 식용유지류: 400.0 mg 이하; 소스·마요네즈: 400.0 mg 이하; 우유·가공유: 400.0 mg 이하; 치즈: 400.0 mg 이하; 초콜릿: 400.0 mg 이하
- RAG 검색용 요약: 기능성 표시·광고 적용을 위한 별표 1 공통기준에서 나트륨 기준은 일반식품: 400.0 mg 이하; 농축과채즙·과채주스: 400.0 mg 이하; 김치류·장류: -; 식용유지류: 400.0 mg 이하; 소스·마요네즈: 400.0 mg 이하; 우유·가공유: 400.0 mg 이하; 치즈: 400.0 mg 이하; 초콜릿: 400.0 mg 이하이다.

### 원재료 또는 성분별 영양성분 개별 기준

#### 개별기준 1. 인삼 - 면역력 증진·피로·뼈 건강 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_001
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 1
- 기능성 원재료 또는 성분: 인삼
- 기능성: 면역력 증진·피로·뼈 건강 개선에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 인삼의 “면역력 증진·피로·뼈 건강 개선에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 2. 홍삼 - 면역력 증진·피로 개선·항산화·갱년기 여성의 건강에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_002
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 2
- 기능성 원재료 또는 성분: 홍삼
- 기능성: 면역력 증진·피로 개선·항산화·갱년기 여성의 건강에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 홍삼의 “면역력 증진·피로 개선·항산화·갱년기 여성의 건강에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 3. 홍삼 - 혈소판 응집 억제를 통한 혈액 흐름에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_003
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 2
- 기능성 원재료 또는 성분: 홍삼
- 기능성: 혈소판 응집 억제를 통한 혈액 흐름에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 포화지방, 저 트랜스지방
- RAG 검색용 요약: 홍삼의 “혈소판 응집 억제를 통한 혈액 흐름에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 포화지방, 저 트랜스지방”에 적합해야 한다.

#### 개별기준 4. 클로렐라 - 피부 건강·항산화·면역력 증진에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_004
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 3
- 기능성 원재료 또는 성분: 클로렐라
- 기능성: 피부 건강·항산화·면역력 증진에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 클로렐라의 “피부 건강·항산화·면역력 증진에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 5. 클로렐라 - 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_005
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 3
- 기능성 원재료 또는 성분: 클로렐라
- 기능성: 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 포화지방, 저 트랜스지방
- RAG 검색용 요약: 클로렐라의 “혈중 콜레스테롤 개선에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 포화지방, 저 트랜스지방”에 적합해야 한다.

#### 개별기준 6. 스피루리나 - 피부 건강·항산화에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_006
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 4
- 기능성 원재료 또는 성분: 스피루리나
- 기능성: 피부 건강·항산화에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 스피루리나의 “피부 건강·항산화에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 7. 스피루리나 - 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_007
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 4
- 기능성 원재료 또는 성분: 스피루리나
- 기능성: 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 포화지방, 저 트랜스지방
- RAG 검색용 요약: 스피루리나의 “혈중 콜레스테롤 개선에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 포화지방, 저 트랜스지방”에 적합해야 한다.

#### 개별기준 8. 프로폴리스 추출물 - 항산화·구강에서의 항균작용에 도움을 줄 수 있음. 구강항균작용은 구강에 직접 접촉할 수 있는 형태에 한하며 섭취량을 적용하지 않음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_008
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 5
- 기능성 원재료 또는 성분: 프로폴리스 추출물
- 기능성: 항산화·구강에서의 항균작용에 도움을 줄 수 있음. 구강항균작용은 구강에 직접 접촉할 수 있는 형태에 한하며 섭취량을 적용하지 않음
- 영양성분 개별 기준: 저 당류
- RAG 검색용 요약: 프로폴리스 추출물의 “항산화·구강에서의 항균작용에 도움을 줄 수 있음. 구강항균작용은 구강에 직접 접촉할 수 있는 형태에 한하며 섭취량을 적용하지 않음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 당류”에 적합해야 한다.

#### 개별기준 9. 구아바잎 추출물 - 식후 혈당상승 억제에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_009
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 6
- 기능성 원재료 또는 성분: 구아바잎 추출물
- 기능성: 식후 혈당상승 억제에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 당류
- RAG 검색용 요약: 구아바잎 추출물의 “식후 혈당상승 억제에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 당류”에 적합해야 한다.

#### 개별기준 10. 바나바잎 추출물 - 식후 혈당상승 억제에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_010
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 7
- 기능성 원재료 또는 성분: 바나바잎 추출물
- 기능성: 식후 혈당상승 억제에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 당류
- RAG 검색용 요약: 바나바잎 추출물의 “식후 혈당상승 억제에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 당류”에 적합해야 한다.

#### 개별기준 11. EPA 및 DHA 함유 유지 - 혈중 중성지질 개선·혈행 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_011
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 8
- 기능성 원재료 또는 성분: EPA 및 DHA 함유 유지
- 기능성: 혈중 중성지질 개선·혈행 개선에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 포화지방, 저 트랜스지방
- RAG 검색용 요약: EPA 및 DHA 함유 유지의 “혈중 중성지질 개선·혈행 개선에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 포화지방, 저 트랜스지방”에 적합해야 한다.

#### 개별기준 12. EPA 및 DHA 함유 유지 - 건조한 눈을 개선하여 눈 건강에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_012
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 8
- 기능성 원재료 또는 성분: EPA 및 DHA 함유 유지
- 기능성: 건조한 눈을 개선하여 눈 건강에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: EPA 및 DHA 함유 유지의 “건조한 눈을 개선하여 눈 건강에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 13. 매실추출물 - 피로 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_013
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 9
- 기능성 원재료 또는 성분: 매실추출물
- 기능성: 피로 개선에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 매실추출물의 “피로 개선에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 14. 구아검/구아검가수분해물 - 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_014
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 10
- 기능성 원재료 또는 성분: 구아검/구아검가수분해물
- 기능성: 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 포화지방, 저 트랜스지방
- RAG 검색용 요약: 구아검/구아검가수분해물의 “혈중 콜레스테롤 개선에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 포화지방, 저 트랜스지방”에 적합해야 한다.

#### 개별기준 15. 구아검/구아검가수분해물 - 식후 혈당상승 억제에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_015
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 10
- 기능성 원재료 또는 성분: 구아검/구아검가수분해물
- 기능성: 식후 혈당상승 억제에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 당류
- RAG 검색용 요약: 구아검/구아검가수분해물의 “식후 혈당상승 억제에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 당류”에 적합해야 한다.

#### 개별기준 16. 구아검/구아검가수분해물 - 장내 유익균 증식·배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_016
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 10
- 기능성 원재료 또는 성분: 구아검/구아검가수분해물
- 기능성: 장내 유익균 증식·배변활동 원활에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 구아검/구아검가수분해물의 “장내 유익균 증식·배변활동 원활에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 17. 난소화성 말토덱스트린 - 식후 혈당상승 억제에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_017
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 11
- 기능성 원재료 또는 성분: 난소화성 말토덱스트린
- 기능성: 식후 혈당상승 억제에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 당류
- RAG 검색용 요약: 난소화성 말토덱스트린의 “식후 혈당상승 억제에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 당류”에 적합해야 한다.

#### 개별기준 18. 난소화성 말토덱스트린 - 혈중 중성지질 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_018
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 11
- 기능성 원재료 또는 성분: 난소화성 말토덱스트린
- 기능성: 혈중 중성지질 개선에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 포화지방, 저 트랜스지방
- RAG 검색용 요약: 난소화성 말토덱스트린의 “혈중 중성지질 개선에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 포화지방, 저 트랜스지방”에 적합해야 한다.

#### 개별기준 19. 난소화성 말토덱스트린 - 배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_019
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 11
- 기능성 원재료 또는 성분: 난소화성 말토덱스트린
- 기능성: 배변활동 원활에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 난소화성 말토덱스트린의 “배변활동 원활에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 20. 대두식이섬유 - 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_020
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 12
- 기능성 원재료 또는 성분: 대두식이섬유
- 기능성: 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 포화지방, 저 트랜스지방
- RAG 검색용 요약: 대두식이섬유의 “혈중 콜레스테롤 개선에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 포화지방, 저 트랜스지방”에 적합해야 한다.

#### 개별기준 21. 대두식이섬유 - 식후 혈당상승 억제에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_021
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 12
- 기능성 원재료 또는 성분: 대두식이섬유
- 기능성: 식후 혈당상승 억제에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 당류
- RAG 검색용 요약: 대두식이섬유의 “식후 혈당상승 억제에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 당류”에 적합해야 한다.

#### 개별기준 22. 대두식이섬유 - 배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_022
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 12
- 기능성 원재료 또는 성분: 대두식이섬유
- 기능성: 배변활동 원활에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 대두식이섬유의 “배변활동 원활에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 23. 목이버섯 식이섬유 - 배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_023
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 13
- 기능성 원재료 또는 성분: 목이버섯 식이섬유
- 기능성: 배변활동 원활에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 목이버섯 식이섬유의 “배변활동 원활에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 24. 밀식이섬유 - 식후 혈당상승 억제에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_024
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 14
- 기능성 원재료 또는 성분: 밀식이섬유
- 기능성: 식후 혈당상승 억제에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 당류
- RAG 검색용 요약: 밀식이섬유의 “식후 혈당상승 억제에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 당류”에 적합해야 한다.

#### 개별기준 25. 밀식이섬유 - 배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_025
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 14
- 기능성 원재료 또는 성분: 밀식이섬유
- 기능성: 배변활동 원활에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 밀식이섬유의 “배변활동 원활에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 26. 보리식이섬유 - 배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_026
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 15
- 기능성 원재료 또는 성분: 보리식이섬유
- 기능성: 배변활동 원활에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 보리식이섬유의 “배변활동 원활에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 27. 옥수수겨 식이섬유 - 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_027
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 16
- 기능성 원재료 또는 성분: 옥수수겨 식이섬유
- 기능성: 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 포화지방, 저 트랜스지방
- RAG 검색용 요약: 옥수수겨 식이섬유의 “혈중 콜레스테롤 개선에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 포화지방, 저 트랜스지방”에 적합해야 한다.

#### 개별기준 28. 옥수수겨 식이섬유 - 식후 혈당상승 억제에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_028
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 16
- 기능성 원재료 또는 성분: 옥수수겨 식이섬유
- 기능성: 식후 혈당상승 억제에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 당류
- RAG 검색용 요약: 옥수수겨 식이섬유의 “식후 혈당상승 억제에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 당류”에 적합해야 한다.

#### 개별기준 29. 이눌린/치커리추출물 - 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_029
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 17
- 기능성 원재료 또는 성분: 이눌린/치커리추출물
- 기능성: 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 포화지방, 저 트랜스지방
- RAG 검색용 요약: 이눌린/치커리추출물의 “혈중 콜레스테롤 개선에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 포화지방, 저 트랜스지방”에 적합해야 한다.

#### 개별기준 30. 이눌린/치커리추출물 - 식후 혈당상승 억제에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_030
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 17
- 기능성 원재료 또는 성분: 이눌린/치커리추출물
- 기능성: 식후 혈당상승 억제에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 당류
- RAG 검색용 요약: 이눌린/치커리추출물의 “식후 혈당상승 억제에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 당류”에 적합해야 한다.

#### 개별기준 31. 이눌린/치커리추출물 - 배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_031
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 17
- 기능성 원재료 또는 성분: 이눌린/치커리추출물
- 기능성: 배변활동 원활에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 이눌린/치커리추출물의 “배변활동 원활에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 32. 차전자피 식이섬유 - 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_032
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 18
- 기능성 원재료 또는 성분: 차전자피 식이섬유
- 기능성: 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 포화지방, 저 트랜스지방
- RAG 검색용 요약: 차전자피 식이섬유의 “혈중 콜레스테롤 개선에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 포화지방, 저 트랜스지방”에 적합해야 한다.

#### 개별기준 33. 차전자피 식이섬유 - 배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_033
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 18
- 기능성 원재료 또는 성분: 차전자피 식이섬유
- 기능성: 배변활동 원활에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 차전자피 식이섬유의 “배변활동 원활에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 34. 호로파종자 식이섬유 - 식후 혈당상승 억제에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_034
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 19
- 기능성 원재료 또는 성분: 호로파종자 식이섬유
- 기능성: 식후 혈당상승 억제에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 당류
- RAG 검색용 요약: 호로파종자 식이섬유의 “식후 혈당상승 억제에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 당류”에 적합해야 한다.

#### 개별기준 35. 알로에 겔 - 피부 건강·장 건강·면역력 증진에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_035
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 20
- 기능성 원재료 또는 성분: 알로에 겔
- 기능성: 피부 건강·장 건강·면역력 증진에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 알로에 겔의 “피부 건강·장 건강·면역력 증진에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 36. 프락토올리고당 - 장내 유익균 증식 및 배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_036
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 21
- 기능성 원재료 또는 성분: 프락토올리고당
- 기능성: 장내 유익균 증식 및 배변활동 원활에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 프락토올리고당의 “장내 유익균 증식 및 배변활동 원활에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 37. 프로바이오틱스 - 유산균 증식 및 유해균 억제·배변활동 원활·장 건강에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_037
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 22
- 기능성 원재료 또는 성분: 프로바이오틱스
- 기능성: 유산균 증식 및 유해균 억제·배변활동 원활·장 건강에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 프로바이오틱스의 “유산균 증식 및 유해균 억제·배변활동 원활·장 건강에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 38. 홍국 - 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_038
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 23
- 기능성 원재료 또는 성분: 홍국
- 기능성: 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 포화지방, 저 트랜스지방
- RAG 검색용 요약: 홍국의 “혈중 콜레스테롤 개선에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 포화지방, 저 트랜스지방”에 적합해야 한다.

#### 개별기준 39. 대두단백 - 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_039
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 24
- 기능성 원재료 또는 성분: 대두단백
- 기능성: 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 포화지방, 저 트랜스지방
- RAG 검색용 요약: 대두단백의 “혈중 콜레스테롤 개선에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 포화지방, 저 트랜스지방”에 적합해야 한다.

#### 개별기준 40. 폴리감마글루탐산 - 체내 칼슘 흡수 촉진에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_040
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 25
- 기능성 원재료 또는 성분: 폴리감마글루탐산
- 기능성: 체내 칼슘 흡수 촉진에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 폴리감마글루탐산의 “체내 칼슘 흡수 촉진에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 41. 마늘 - 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_041
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 26
- 기능성 원재료 또는 성분: 마늘
- 기능성: 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- 영양성분 개별 기준: 저 포화지방, 저 트랜스지방
- RAG 검색용 요약: 마늘의 “혈중 콜레스테롤 개선에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “저 포화지방, 저 트랜스지방”에 적합해야 한다.

#### 개별기준 42. 라피노스 - 장내 유익균의 증식과 유해균의 억제에 도움을 줄 수 있음. 배변활동을 원활히 하는 데 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_042
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 27
- 기능성 원재료 또는 성분: 라피노스
- 기능성: 장내 유익균의 증식과 유해균의 억제에 도움을 줄 수 있음. 배변활동을 원활히 하는 데 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 라피노스의 “장내 유익균의 증식과 유해균의 억제에 도움을 줄 수 있음. 배변활동을 원활히 하는 데 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 43. 분말한천 - 배변활동에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_043
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 28
- 기능성 원재료 또는 성분: 분말한천
- 기능성: 배변활동에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 분말한천의 “배변활동에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

#### 개별기준 44. 유단백가수분해물 - 스트레스로 인한 긴장 완화에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_individual_nutrition_044
- source_type: nutrition_individual_standard
- domain: general_food_functionality_ad
- 연번: 29
- 기능성 원재료 또는 성분: 유단백가수분해물
- 기능성: 스트레스로 인한 긴장 완화에 도움을 줄 수 있음
- 영양성분 개별 기준: -
- RAG 검색용 요약: 유단백가수분해물의 “스트레스로 인한 긴장 완화에 도움을 줄 수 있음” 기능성을 표시 또는 광고하려는 식품등은 영양성분 개별 기준 “-”에 적합해야 한다.

## 별표 2. 기능성 원재료 또는 성분별 기능성 및 1일 섭취기준량

### 기능성 원재료 1. 인삼 - 면역력 증진·피로 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_001
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 1
- 기능성 원재료 또는 성분: 인삼
- 기능성: 면역력 증진·피로 개선에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 진세노사이드 Rg1과 Rb1의 합계
- RAG 검색용 요약: 인삼의 “면역력 증진·피로 개선에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 진세노사이드 Rg1과 Rb1의 합계을 기준 성분으로 본다.

### 기능성 원재료 2. 인삼 - 뼈 건강에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_002
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 1
- 기능성 원재료 또는 성분: 인삼
- 기능성: 뼈 건강에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 진세노사이드 Rg1과 Rb1의 합계
- RAG 검색용 요약: 인삼의 “뼈 건강에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 진세노사이드 Rg1과 Rb1의 합계을 기준 성분으로 본다.

### 기능성 원재료 3. 홍삼 - 면역력 증진·피로 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_003
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 2
- 기능성 원재료 또는 성분: 홍삼
- 기능성: 면역력 증진·피로 개선에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 진세노사이드 Rg1, Rb1 및 Rg3의 합계
- RAG 검색용 요약: 홍삼의 “면역력 증진·피로 개선에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 진세노사이드 Rg1, Rb1 및 Rg3의 합계을 기준 성분으로 본다.

### 기능성 원재료 4. 홍삼 - 혈소판 응집 억제를 통한 혈액 흐름·항산화에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_004
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 2
- 기능성 원재료 또는 성분: 홍삼
- 기능성: 혈소판 응집 억제를 통한 혈액 흐름·항산화에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 진세노사이드 Rg1, Rb1 및 Rg3의 합계
- RAG 검색용 요약: 홍삼의 “혈소판 응집 억제를 통한 혈액 흐름·항산화에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 진세노사이드 Rg1, Rb1 및 Rg3의 합계을 기준 성분으로 본다.

### 기능성 원재료 5. 홍삼 - 갱년기 여성의 건강에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_005
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 2
- 기능성 원재료 또는 성분: 홍삼
- 기능성: 갱년기 여성의 건강에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 진세노사이드 Rg1, Rb1 및 Rg3의 합계
- RAG 검색용 요약: 홍삼의 “갱년기 여성의 건강에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 진세노사이드 Rg1, Rb1 및 Rg3의 합계을 기준 성분으로 본다.

### 기능성 원재료 6. 클로렐라 - 피부 건강·항산화에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_006
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 3
- 기능성 원재료 또는 성분: 클로렐라
- 기능성: 피부 건강·항산화에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 총엽록소
- RAG 검색용 요약: 클로렐라의 “피부 건강·항산화에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 총엽록소을 기준 성분으로 본다.

### 기능성 원재료 7. 클로렐라 - 면역력 증진·혈중 콜레스테롤 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_007
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 3
- 기능성 원재료 또는 성분: 클로렐라
- 기능성: 면역력 증진·혈중 콜레스테롤 개선에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 총엽록소
- RAG 검색용 요약: 클로렐라의 “면역력 증진·혈중 콜레스테롤 개선에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 총엽록소을 기준 성분으로 본다.

### 기능성 원재료 8. 스피루리나 - 피부 건강·항산화에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_008
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 4
- 기능성 원재료 또는 성분: 스피루리나
- 기능성: 피부 건강·항산화에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 총엽록소
- RAG 검색용 요약: 스피루리나의 “피부 건강·항산화에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 총엽록소을 기준 성분으로 본다.

### 기능성 원재료 9. 스피루리나 - 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_009
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 4
- 기능성 원재료 또는 성분: 스피루리나
- 기능성: 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 총엽록소
- RAG 검색용 요약: 스피루리나의 “혈중 콜레스테롤 개선에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 총엽록소을 기준 성분으로 본다.

### 기능성 원재료 10. 프로폴리스 추출물 - 항산화·구강에서의 항균작용에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_010
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 5
- 기능성 원재료 또는 성분: 프로폴리스 추출물
- 기능성: 항산화·구강에서의 항균작용에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 총플라보노이드
- RAG 검색용 요약: 프로폴리스 추출물의 “항산화·구강에서의 항균작용에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 총플라보노이드을 기준 성분으로 본다.

### 기능성 원재료 11. 구아바잎 추출물 - 식후 혈당상승 억제에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_011
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 6
- 기능성 원재료 또는 성분: 구아바잎 추출물
- 기능성: 식후 혈당상승 억제에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 총폴리페놀
- RAG 검색용 요약: 구아바잎 추출물의 “식후 혈당상승 억제에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 총폴리페놀을 기준 성분으로 본다.

### 기능성 원재료 12. 바나바잎 추출물 - 식후 혈당상승 억제에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_012
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 7
- 기능성 원재료 또는 성분: 바나바잎 추출물
- 기능성: 식후 혈당상승 억제에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 코로솔산
- RAG 검색용 요약: 바나바잎 추출물의 “식후 혈당상승 억제에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 코로솔산을 기준 성분으로 본다.

### 기능성 원재료 13. EPA 및 DHA 함유 유지 - 혈중 중성지질 개선·혈행 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_013
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 8
- 기능성 원재료 또는 성분: EPA 및 DHA 함유 유지
- 기능성: 혈중 중성지질 개선·혈행 개선에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: EPA와 DHA의 합
- RAG 검색용 요약: EPA 및 DHA 함유 유지의 “혈중 중성지질 개선·혈행 개선에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 EPA와 DHA의 합을 기준 성분으로 본다.

### 기능성 원재료 14. EPA 및 DHA 함유 유지 - 건조한 눈을 개선하여 눈 건강에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_014
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 8
- 기능성 원재료 또는 성분: EPA 및 DHA 함유 유지
- 기능성: 건조한 눈을 개선하여 눈 건강에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: EPA와 DHA의 합
- RAG 검색용 요약: EPA 및 DHA 함유 유지의 “건조한 눈을 개선하여 눈 건강에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 EPA와 DHA의 합을 기준 성분으로 본다.

### 기능성 원재료 15. 매실추출물 - 피로 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_015
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 9
- 기능성 원재료 또는 성분: 매실추출물
- 기능성: 피로 개선에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 구연산
- RAG 검색용 요약: 매실추출물의 “피로 개선에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 구연산을 기준 성분으로 본다.

### 기능성 원재료 16. 구아검/구아검가수분해물 - 혈중 콜레스테롤 개선·식후 혈당상승 억제·배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_016
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 10
- 기능성 원재료 또는 성분: 구아검/구아검가수분해물
- 기능성: 혈중 콜레스테롤 개선·식후 혈당상승 억제·배변활동 원활에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 구아검/구아검가수분해물 식이섬유
- RAG 검색용 요약: 구아검/구아검가수분해물의 “혈중 콜레스테롤 개선·식후 혈당상승 억제·배변활동 원활에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 구아검/구아검가수분해물 식이섬유을 기준 성분으로 본다.

### 기능성 원재료 17. 구아검/구아검가수분해물 - 장내 유익균 증식에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_017
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 10
- 기능성 원재료 또는 성분: 구아검/구아검가수분해물
- 기능성: 장내 유익균 증식에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 구아검/구아검가수분해물 식이섬유
- RAG 검색용 요약: 구아검/구아검가수분해물의 “장내 유익균 증식에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 구아검/구아검가수분해물 식이섬유을 기준 성분으로 본다.

### 기능성 원재료 18. 난소화성 말토덱스트린 - 식후 혈당상승 억제에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_018
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 11
- 기능성 원재료 또는 성분: 난소화성 말토덱스트린
- 기능성: 식후 혈당상승 억제에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 난소화성 말토덱스트린 식이섬유
- RAG 검색용 요약: 난소화성 말토덱스트린의 “식후 혈당상승 억제에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 난소화성 말토덱스트린 식이섬유을 기준 성분으로 본다.

### 기능성 원재료 19. 난소화성 말토덱스트린 - 혈중 중성지질 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_019
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 11
- 기능성 원재료 또는 성분: 난소화성 말토덱스트린
- 기능성: 혈중 중성지질 개선에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 난소화성 말토덱스트린 식이섬유
- RAG 검색용 요약: 난소화성 말토덱스트린의 “혈중 중성지질 개선에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 난소화성 말토덱스트린 식이섬유을 기준 성분으로 본다.

### 기능성 원재료 20. 난소화성 말토덱스트린 - 배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_020
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 11
- 기능성 원재료 또는 성분: 난소화성 말토덱스트린
- 기능성: 배변활동 원활에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 난소화성 말토덱스트린 식이섬유
- RAG 검색용 요약: 난소화성 말토덱스트린의 “배변활동 원활에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 난소화성 말토덱스트린 식이섬유을 기준 성분으로 본다.

### 기능성 원재료 21. 대두식이섬유 - 혈중 콜레스테롤 개선·배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_021
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 12
- 기능성 원재료 또는 성분: 대두식이섬유
- 기능성: 혈중 콜레스테롤 개선·배변활동 원활에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 대두식이섬유
- RAG 검색용 요약: 대두식이섬유의 “혈중 콜레스테롤 개선·배변활동 원활에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 대두식이섬유을 기준 성분으로 본다.

### 기능성 원재료 22. 대두식이섬유 - 식후 혈당상승 억제에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_022
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 12
- 기능성 원재료 또는 성분: 대두식이섬유
- 기능성: 식후 혈당상승 억제에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 대두식이섬유
- RAG 검색용 요약: 대두식이섬유의 “식후 혈당상승 억제에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 대두식이섬유을 기준 성분으로 본다.

### 기능성 원재료 23. 목이버섯 식이섬유 - 배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_023
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 13
- 기능성 원재료 또는 성분: 목이버섯 식이섬유
- 기능성: 배변활동 원활에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 목이버섯 식이섬유
- RAG 검색용 요약: 목이버섯 식이섬유의 “배변활동 원활에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 목이버섯 식이섬유을 기준 성분으로 본다.

### 기능성 원재료 24. 밀식이섬유 - 식후 혈당상승 억제에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_024
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 14
- 기능성 원재료 또는 성분: 밀식이섬유
- 기능성: 식후 혈당상승 억제에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 밀식이섬유
- RAG 검색용 요약: 밀식이섬유의 “식후 혈당상승 억제에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 밀식이섬유을 기준 성분으로 본다.

### 기능성 원재료 25. 밀식이섬유 - 배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_025
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 14
- 기능성 원재료 또는 성분: 밀식이섬유
- 기능성: 배변활동 원활에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 밀식이섬유
- RAG 검색용 요약: 밀식이섬유의 “배변활동 원활에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 밀식이섬유을 기준 성분으로 본다.

### 기능성 원재료 26. 보리식이섬유 - 배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_026
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 15
- 기능성 원재료 또는 성분: 보리식이섬유
- 기능성: 배변활동 원활에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 보리식이섬유
- RAG 검색용 요약: 보리식이섬유의 “배변활동 원활에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 보리식이섬유을 기준 성분으로 본다.

### 기능성 원재료 27. 옥수수겨 식이섬유 - 혈중 콜레스테롤 개선·식후 혈당상승 억제에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_027
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 16
- 기능성 원재료 또는 성분: 옥수수겨 식이섬유
- 기능성: 혈중 콜레스테롤 개선·식후 혈당상승 억제에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 옥수수겨 식이섬유
- RAG 검색용 요약: 옥수수겨 식이섬유의 “혈중 콜레스테롤 개선·식후 혈당상승 억제에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 옥수수겨 식이섬유을 기준 성분으로 본다.

### 기능성 원재료 28. 이눌린/치커리추출물 - 혈중 콜레스테롤 개선, 식후 혈당상승 억제에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_028
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 17
- 기능성 원재료 또는 성분: 이눌린/치커리추출물
- 기능성: 혈중 콜레스테롤 개선, 식후 혈당상승 억제에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 이눌린/치커리추출물 식이섬유
- RAG 검색용 요약: 이눌린/치커리추출물의 “혈중 콜레스테롤 개선, 식후 혈당상승 억제에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 이눌린/치커리추출물 식이섬유을 기준 성분으로 본다.

### 기능성 원재료 29. 이눌린/치커리추출물 - 배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_029
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 17
- 기능성 원재료 또는 성분: 이눌린/치커리추출물
- 기능성: 배변활동 원활에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 이눌린/치커리추출물 식이섬유
- RAG 검색용 요약: 이눌린/치커리추출물의 “배변활동 원활에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 이눌린/치커리추출물 식이섬유을 기준 성분으로 본다.

### 기능성 원재료 30. 차전자피 식이섬유 - 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_030
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 18
- 기능성 원재료 또는 성분: 차전자피 식이섬유
- 기능성: 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 차전자피 식이섬유
- RAG 검색용 요약: 차전자피 식이섬유의 “혈중 콜레스테롤 개선에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 차전자피 식이섬유을 기준 성분으로 본다.

### 기능성 원재료 31. 차전자피 식이섬유 - 배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_031
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 18
- 기능성 원재료 또는 성분: 차전자피 식이섬유
- 기능성: 배변활동 원활에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 차전자피 식이섬유
- RAG 검색용 요약: 차전자피 식이섬유의 “배변활동 원활에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 차전자피 식이섬유을 기준 성분으로 본다.

### 기능성 원재료 32. 호로파종자 식이섬유 - 식후 혈당상승 억제에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_032
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 19
- 기능성 원재료 또는 성분: 호로파종자 식이섬유
- 기능성: 식후 혈당상승 억제에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 호로파종자 식이섬유
- RAG 검색용 요약: 호로파종자 식이섬유의 “식후 혈당상승 억제에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 호로파종자 식이섬유을 기준 성분으로 본다.

### 기능성 원재료 33. 알로에 겔 - 피부 건강·장 건강·면역력 증진에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_033
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 20
- 기능성 원재료 또는 성분: 알로에 겔
- 기능성: 피부 건강·장 건강·면역력 증진에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 총다당체 함량
- RAG 검색용 요약: 알로에 겔의 “피부 건강·장 건강·면역력 증진에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 총다당체 함량을 기준 성분으로 본다.

### 기능성 원재료 34. 프락토올리고당 - 장내 유익균 증식 및 배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_034
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 21
- 기능성 원재료 또는 성분: 프락토올리고당
- 기능성: 장내 유익균 증식 및 배변활동 원활에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 프락토올리고당
- RAG 검색용 요약: 프락토올리고당의 “장내 유익균 증식 및 배변활동 원활에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 프락토올리고당을 기준 성분으로 본다.

### 기능성 원재료 35. 프로바이오틱스 - 유산균 증식 및 유해균 억제·배변활동 원활·장 건강에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_035
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 22
- 기능성 원재료 또는 성분: 프로바이오틱스
- 기능성: 유산균 증식 및 유해균 억제·배변활동 원활·장 건강에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 생균수 등 프로바이오틱스 기준
- RAG 검색용 요약: 프로바이오틱스의 “유산균 증식 및 유해균 억제·배변활동 원활·장 건강에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 생균수 등 프로바이오틱스 기준을 기준 성분으로 본다.

### 기능성 원재료 36. 홍국 - 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_036
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 23
- 기능성 원재료 또는 성분: 홍국
- 기능성: 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 총 모나콜린 K
- RAG 검색용 요약: 홍국의 “혈중 콜레스테롤 개선에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 총 모나콜린 K을 기준 성분으로 본다.

### 기능성 원재료 37. 대두단백 - 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_037
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 24
- 기능성 원재료 또는 성분: 대두단백
- 기능성: 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 대두단백
- RAG 검색용 요약: 대두단백의 “혈중 콜레스테롤 개선에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 대두단백을 기준 성분으로 본다.

### 기능성 원재료 38. 폴리감마글루탐산 - 체내 칼슘 흡수 촉진에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_038
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 25
- 기능성 원재료 또는 성분: 폴리감마글루탐산
- 기능성: 체내 칼슘 흡수 촉진에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 폴리감마글루탐산
- RAG 검색용 요약: 폴리감마글루탐산의 “체내 칼슘 흡수 촉진에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 폴리감마글루탐산을 기준 성분으로 본다.

### 기능성 원재료 39. 마늘 - 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_039
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 26
- 기능성 원재료 또는 성분: 마늘
- 기능성: 혈중 콜레스테롤 개선에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 마늘 분말
- RAG 검색용 요약: 마늘의 “혈중 콜레스테롤 개선에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 마늘 분말을 기준 성분으로 본다.

### 기능성 원재료 40. 라피노스 - 장내 유익균의 증식과 유해균 억제 및 배변활동 원활에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_040
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 27
- 기능성 원재료 또는 성분: 라피노스
- 기능성: 장내 유익균의 증식과 유해균 억제 및 배변활동 원활에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 라피노스
- RAG 검색용 요약: 라피노스의 “장내 유익균의 증식과 유해균 억제 및 배변활동 원활에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 라피노스을 기준 성분으로 본다.

### 기능성 원재료 41. 분말한천 - 배변활동에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_041
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 28
- 기능성 원재료 또는 성분: 분말한천
- 기능성: 배변활동에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 분말한천 또는 총식이섬유
- RAG 검색용 요약: 분말한천의 “배변활동에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 분말한천 또는 총식이섬유을 기준 성분으로 본다.

### 기능성 원재료 42. 유단백가수분해물 - 스트레스로 인한 긴장 완화에 도움을 줄 수 있음
- chunk_id: functional_food_general_claim_2024_62_daily_intake_042
- source_type: functional_ingredient_daily_intake
- domain: general_food_functionality_ad
- 연번: 29
- 기능성 원재료 또는 성분: 유단백가수분해물
- 기능성: 스트레스로 인한 긴장 완화에 도움을 줄 수 있음
- 1일 섭취기준량 기준 성분: 유단백가수분해물 또는 알파에스1카제인
- RAG 검색용 요약: 유단백가수분해물의 “스트레스로 인한 긴장 완화에 도움을 줄 수 있음” 기능성은 1일 섭취기준량 판단 시 유단백가수분해물 또는 알파에스1카제인을 기준 성분으로 본다.

## 도안 및 별지 서식

### 기능성 표시 서식 도안
- chunk_id: functional_food_general_claim_2024_62_label_design_template
- source_type: label_design_template
- domain: general_food_functionality_ad
- RAG 검색용 요약: 제6조제1항 관련 도안은 기능성 표시 영역에 기능성 성분 함량, 1일 섭취기준량, 섭취 시 주의사항, 균형 잡힌 식생활 권장 문구, 이상사례 상담 문구, 질병 예방·치료용 제품이 아니라는 문구 등을 포함하는 예시를 제시한다.

### 기능성 원재료의 일반식품 사용신청서
- chunk_id: functional_food_general_claim_2024_62_application_form
- source_type: application_form
- domain: general_food_functionality_ad
- RAG 검색용 요약: 제4조제1항제2호에 따라 기능성 원료의 일반식품 사용을 신청하는 별지 서식이며, 처리기간은 60일이고 처리절차는 신청서 작성, 접수, 검토, 결재, 통보 순서이다.
