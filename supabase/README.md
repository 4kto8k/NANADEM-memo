# 랭킹 저장소 (Supabase)

- 프로젝트: NoMoreHalliGalli (`vzbjcrdfgcdsnoppcbxn`), 표 이름은 모두 `holdem_`으로 시작
- `holdem_games`: 게임 1판 (날짜, 테이블, 시작/종료 시간)
- `holdem_results`: 그 게임의 사람별 결과 (자리, 이름, 등수, 미션, 뽑기, 당일총점)
- `holdem_secret`: 딜러 비밀번호 해시 (외부에서 읽을 수 없음)

누구나 읽을 수 있고, 쓰기·삭제는 딜러 비밀번호를 확인하는 함수로만 됩니다.

- `holdem_save_game(p_pin, p_game, p_game_id)`: 저장 / 같은 게임 다시 저장
- `holdem_delete_game(p_pin, p_game_id)`: 게임 기록 삭제
- `holdem_change_pin(p_old, p_new)`: 비밀번호 변경 (앱의 랭킹 화면 맨 아래)

비밀번호를 8번 틀리면 10분 동안 잠깁니다.

## 여러 테이블 토너먼트

- `holdem_tourneys`: 토너먼트 (상태, 세팅, 공용 타이머 `clock`, 최근 동작 알림, `rev`)
- `holdem_ttables`: 테이블 번호·이름·시작 딜러
- `holdem_tplayers`: 참가자 (테이블, 자리, 리바인 횟수, 탈락 순서 `bust_seq`). 등수는 탈락 순서로 계산
- `holdem_t_state(p_id)`: 전체 상태 + 서버 시각(폰마다 시계 차이 보정)
- `holdem_t_create`, `holdem_t_do`: 딜러 비밀번호를 확인하고 변경
