# Draft Database Schema — M-15

Early draft for Week 1 (Practice Engine Foundation). Will evolve as later
weeks add flashcards, badges, etc.

## users
| Column | Type | Notes |
|---|---|---|
| id | UUID / SERIAL | primary key |
| name | TEXT | |
| email | TEXT | unique |
| role | TEXT | student / instructor / admin |
| created_at | TIMESTAMP | |

## practice_attempts
| Column | Type | Notes |
|---|---|---|
| id | UUID / SERIAL | primary key |
| student_id | FK -> users.id | |
| exam_id | FK -> exams.id | which exam this practice run is based on |
| started_at | TIMESTAMP | |
| completed_at | TIMESTAMP | nullable until finished |
| score | NUMERIC | auto-graded portion |
| answers | JSONB | per-question responses |

> Note: practice_attempts is intentionally separate from the platform's
> official `results` table — practice data must never be visible to
> instructors/admins in grading views (per spec non-functional requirement).

## flashcards (added Week 2)
| Column | Type | Notes |
|---|---|---|
| id | UUID / SERIAL | primary key |
| student_id | FK -> users.id | |
| question_id | FK -> questions.id | |
| deck_id | FK -> decks.id | |
| front | TEXT | |
| back | TEXT | |
| sm2_interval | INTEGER | added Week 3 |
| sm2_ease_factor | NUMERIC | added Week 3 |
| next_review_at | TIMESTAMP | added Week 3 |

## student_topic_stats (added Week 4)
| Column | Type | Notes |
|---|---|---|
| student_id | FK -> users.id | |
| topic_tag | TEXT | |
| avg_score | NUMERIC | |
| attempts_count | INTEGER | |
| updated_at | TIMESTAMP | refreshed by nightly aggregation job |

## badge_definitions / badge_awards (added Week 5)
To be designed in Week 5 — placeholder only.
