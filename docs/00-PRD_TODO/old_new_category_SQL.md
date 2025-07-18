-- 구약/신약 그룹 및 66권 성경책 category 테이블 등록 SQL
-- (Supabase 기준, uuid는 예시)
-- RLS(행 수준 보안)는 개발 중 비활성화 권장

-- 1. 구약/신약 그룹 추가
insert into category (id, name, parent_id, "order") values
  ('609528b7-a6b1-4112-97e3-c89ba34e5b2c', '구약', null, 1),
  ('0fed4fb2-21ce-4972-bbcb-bfad7d541e08', '신약', null, 2);

-- 2. 구약 39권 추가 (parent_id: 구약 그룹)
INSERT INTO category (id, name, parent_id, "order", created_at) VALUES
  (gen_random_uuid(), '창세기', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 1, NOW()),
  (gen_random_uuid(), '출애굽기', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 2, NOW()),
  (gen_random_uuid(), '레위기', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 3, NOW()),
  (gen_random_uuid(), '민수기', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 4, NOW()),
  (gen_random_uuid(), '신명기', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 5, NOW()),
  (gen_random_uuid(), '여호수아', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 6, NOW()),
  (gen_random_uuid(), '사사기', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 7, NOW()),
  (gen_random_uuid(), '룻기', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 8, NOW()),
  (gen_random_uuid(), '사무엘상', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 9, NOW()),
  (gen_random_uuid(), '사무엘하', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 10, NOW()),
  (gen_random_uuid(), '열왕기상', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 11, NOW()),
  (gen_random_uuid(), '열왕기하', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 12, NOW()),
  (gen_random_uuid(), '역대상', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 13, NOW()),
  (gen_random_uuid(), '역대하', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 14, NOW()),
  (gen_random_uuid(), '에스라', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 15, NOW()),
  (gen_random_uuid(), '느헤미야', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 16, NOW()),
  (gen_random_uuid(), '에스더', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 17, NOW()),
  (gen_random_uuid(), '욥기', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 18, NOW()),
  (gen_random_uuid(), '시편', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 19, NOW()),
  (gen_random_uuid(), '잠언', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 20, NOW()),
  (gen_random_uuid(), '전도서', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 21, NOW()),
  (gen_random_uuid(), '아가', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 22, NOW()),
  (gen_random_uuid(), '이사야', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 23, NOW()),
  (gen_random_uuid(), '예레미야', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 24, NOW()),
  (gen_random_uuid(), '예레미야애가', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 25, NOW()),
  (gen_random_uuid(), '에스겔', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 26, NOW()),
  (gen_random_uuid(), '다니엘', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 27, NOW()),
  (gen_random_uuid(), '호세아', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 28, NOW()),
  (gen_random_uuid(), '요엘', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 29, NOW()),
  (gen_random_uuid(), '아모스', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 30, NOW()),
  (gen_random_uuid(), '오바댜', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 31, NOW()),
  (gen_random_uuid(), '요나', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 32, NOW()),
  (gen_random_uuid(), '미가', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 33, NOW()),
  (gen_random_uuid(), '나훔', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 34, NOW()),
  (gen_random_uuid(), '하박국', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 35, NOW()),
  (gen_random_uuid(), '스바냐', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 36, NOW()),
  (gen_random_uuid(), '학개', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 37, NOW()),
  (gen_random_uuid(), '스가랴', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 38, NOW()),
  (gen_random_uuid(), '말라기', '609528b7-a6b1-4112-97e3-c89ba34e5b2c', 39, NOW());

-- 3. 신약 27권 추가 (parent_id: 신약 그룹)
INSERT INTO category (id, name, parent_id, "order", created_at) VALUES
  (gen_random_uuid(), '마태복음', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 1, NOW()),
  (gen_random_uuid(), '마가복음', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 2, NOW()),
  (gen_random_uuid(), '누가복음', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 3, NOW()),
  (gen_random_uuid(), '요한복음', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 4, NOW()),
  (gen_random_uuid(), '사도행전', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 5, NOW()),
  (gen_random_uuid(), '로마서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 6, NOW()),
  (gen_random_uuid(), '고린도전서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 7, NOW()),
  (gen_random_uuid(), '고린도후서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 8, NOW()),
  (gen_random_uuid(), '갈라디아서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 9, NOW()),
  (gen_random_uuid(), '에베소서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 10, NOW()),
  (gen_random_uuid(), '빌립보서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 11, NOW()),
  (gen_random_uuid(), '골로새서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 12, NOW()),
  (gen_random_uuid(), '데살로니가전서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 13, NOW()),
  (gen_random_uuid(), '데살로니가후서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 14, NOW()),
  (gen_random_uuid(), '디모데전서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 15, NOW()),
  (gen_random_uuid(), '디모데후서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 16, NOW()),
  (gen_random_uuid(), '디도서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 17, NOW()),
  (gen_random_uuid(), '빌레몬서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 18, NOW()),
  (gen_random_uuid(), '히브리서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 19, NOW()),
  (gen_random_uuid(), '야고보서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 20, NOW()),
  (gen_random_uuid(), '베드로전서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 21, NOW()),
  (gen_random_uuid(), '베드로후서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 22, NOW()),
  (gen_random_uuid(), '요한일서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 23, NOW()),
  (gen_random_uuid(), '요한이서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 24, NOW()),
  (gen_random_uuid(), '요한삼서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 25, NOW()),
  (gen_random_uuid(), '유다서', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 26, NOW()),
  (gen_random_uuid(), '요한계시록', '0fed4fb2-21ce-4972-bbcb-bfad7d541e08', 27, NOW());

  