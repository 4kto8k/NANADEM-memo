# 랭킹 저장소 (Supabase)

- 프로젝트: NoMoreHalliGalli (`vzbjcrdfgcdsnoppcbxn`), 표 이름은 모두 `holdem_`으로 시작
- `holdem_games`: 게임 1판 (날짜, 테이블, 시작/종료 시간)
- `holdem_results`: 그 게임의 사람별 결과 (자리, 이름, 등수, 미션, 뽑기, 당일총점)
- `holdem_secret`: 딜러 비밀번호 해시 (외부에서 읽을 수 없음)

누구나 읽을 수 있고, 쓰기·삭제는 딜러 비밀번호를 확인하는 함수로만 됩니다.

- `holdem_save_game(p_pin, p_game, p_game_id)`: 저장 / 같은 게임 다시 저장
- `holdem_delete_game(p_pin, p_game_id)`: 게임 기록 삭제
- `holdem_month_open(d)`: 이번 달(한국 시간) 날짜인지. 어제 날짜는 오늘 낮 12시까지 허용(월말 밤샘 게임). 저장·다시 저장·삭제는 여기서 막히면 `closed_month`
- `holdem_change_pin(p_old, p_new)`: 비밀번호 변경 (앱의 랭킹 화면 맨 아래)

비밀번호를 8번 틀리면 10분 동안 잠깁니다.

## 여러 테이블 토너먼트

- `holdem_tourneys`: 토너먼트 (상태, 세팅, 공용 타이머 `clock`, 최근 동작 알림, `rev`)
- `holdem_ttables`: 테이블 번호·이름·시작 딜러, 담당 폰(`owner_hash`: 폰 키의 해시, `owner_name`: 맡은 딜러 이름)
- `holdem_tplayers`: 참가자 (테이블, 자리, 리바인 횟수, 탈락 순서 `bust_seq`). 등수는 탈락 순서로 계산
- `holdem_pin_ok(p_pin)`: 딜러 비밀번호가 맞는지만 확인(여러 테이블 들어갈 때, 틀린 횟수 잠금은 같음)
- `holdem_t_state(p_id)`: 전체 상태 + 서버 시각(폰마다 시계 차이 보정)
- `holdem_t_create`, `holdem_t_do`: 딜러 비밀번호를 확인하고 변경. 타이머·세팅·삭제는 방장 키(만든 폰에만 저장, 서버에는 해시만)도 확인. 타이머(`clock` 동작)는 딜러 비밀번호만 맞으면 누구나. 다른 동작에 딸린 타이머 변경(탈락·파이널 자리 뽑기의 자동 정지)은 방장·플로어가 아니면 멈추기만
- 플로어: `holdem_tourneys.floor_hash`(플로어 키의 해시)·`floor_name`. 방장이 `floor_set`(새 키, 예전 키는 무효. 키가 비면 플로어 없앰), 플로어나 방장이 `floor_name`. 플로어 키(`p_args.floor`)가 맞으면 방장처럼 타이머·세팅·모든 테이블 조작 가능. `delete`·`host_name`·`host_take`·`floor_set`은 방장만
- 테이블 담당: `claim`(이 폰이 테이블을 맡음, 이름이 있으면 딜러로. 이 폰이 맡던 다른 테이블은 놓음), `release`(담당 풀기: 방장 또는 담당 폰). 방장이 아니면 다른 폰이 맡은 테이블의 사람·테이블을 바꾸는 동작(bust·player_set·player_del·unbust·player_add·assign·table·table_del)은 `not_owner`. 검사는 `holdem_t_tbl_ok(토너먼트, 테이블, 폰 해시)`

## 관리자

- `holdem_admin(p_pw, p_action, p_args)`: 관리자 비밀번호(딜러 비밀번호와 별도, 해시만 저장, 8번 틀리면 30분 잠금)를 확인하고
  `check` · `delete` · `cleanup`(끝났거나 지난 토너먼트) · `end`(강제 종료) · `host`(방장 맡기) · `change_pw`
  · `game_delete`(게임 기록 지우기) · `game_results`(게임 결과 고치기) · `rename`(그 달 기록에서 이름 바꾸기·합치기, from_day~to_day) — 지난달 기록도 가능
- 방장 넘겨받기는 방장 본인 또는 관리자만 가능

## 관전 (일반 게임)

- `holdem_live`: 공유 코드, 공유한 폰의 키 해시, 게임 상태(payload), 올린 시각. 직접 읽기·쓰기 불가
- `holdem_live_start(p_pin, p_owner, p_payload)`: 딜러 비밀번호 확인 후 4글자 코드 발급, 이틀 지난 공유 정리
- `holdem_live_push`, `holdem_live_stop`: 공유한 폰만(키 확인)
- `holdem_live_get(p_code)`: 누구나 코드로 읽기 + 서버 시각
