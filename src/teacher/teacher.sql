create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  teacher_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  grade_level text,
  phone text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  teacher_user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  subject text not null,
  lesson_date date not null,
  start_time time,
  end_time time,
  notes text,
  status text not null default 'planned'
    check (status in ('planned', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance (
  id uuid primary key default gen_random_uuid(),
  teacher_user_id uuid not null references auth.users(id) on delete cascade,
  student_id uuid references public.students(id) on delete set null,
  lesson_id uuid references public.lessons(id) on delete set null,
  status text not null default 'present'
    check (status in ('present', 'absent', 'late')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists students_teacher_idx
  on public.students (teacher_user_id);

create index if not exists lessons_teacher_idx
  on public.lessons (teacher_user_id);

create index if not exists lessons_student_idx
  on public.lessons (student_id);

create index if not exists lessons_date_idx
  on public.lessons (lesson_date);

create index if not exists attendance_teacher_idx
  on public.attendance (teacher_user_id);

create index if not exists attendance_student_idx
  on public.attendance (student_id);

create index if not exists attendance_lesson_idx
  on public.attendance (lesson_id);


-- shared updated_at trigger function
create or replace function public.set_teacher_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_students_updated_at on public.students;
create trigger set_students_updated_at
before update on public.students
for each row
execute function public.set_teacher_updated_at();

drop trigger if exists set_lessons_updated_at on public.lessons;
create trigger set_lessons_updated_at
before update on public.lessons
for each row
execute function public.set_teacher_updated_at();

drop trigger if exists set_attendance_updated_at on public.attendance;
create trigger set_attendance_updated_at
before update on public.attendance
for each row
execute function public.set_teacher_updated_at();


-- RLS
alter table public.students enable row level security;
alter table public.lessons enable row level security;
alter table public.attendance enable row level security;


-- STUDENTS

drop policy if exists "teacher_read_own_students" on public.students;
create policy "teacher_read_own_students"
on public.students
for select
to authenticated
using (
  teacher_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "teacher_insert_own_students" on public.students;
create policy "teacher_insert_own_students"
on public.students
for insert
to authenticated
with check (
  teacher_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "teacher_update_own_students" on public.students;
create policy "teacher_update_own_students"
on public.students
for update
to authenticated
using (
  teacher_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  teacher_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "teacher_delete_own_students" on public.students;
create policy "teacher_delete_own_students"
on public.students
for delete
to authenticated
using (
  teacher_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);


-- LESSONS

drop policy if exists "teacher_read_own_lessons" on public.lessons;
create policy "teacher_read_own_lessons"
on public.lessons
for select
to authenticated
using (
  teacher_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "teacher_insert_own_lessons" on public.lessons;
create policy "teacher_insert_own_lessons"
on public.lessons
for insert
to authenticated
with check (
  teacher_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "teacher_update_own_lessons" on public.lessons;
create policy "teacher_update_own_lessons"
on public.lessons
for update
to authenticated
using (
  teacher_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  teacher_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "teacher_delete_own_lessons" on public.lessons;
create policy "teacher_delete_own_lessons"
on public.lessons
for delete
to authenticated
using (
  teacher_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);


-- ATTENDANCE

drop policy if exists "teacher_read_own_attendance" on public.attendance;
create policy "teacher_read_own_attendance"
on public.attendance
for select
to authenticated
using (
  teacher_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "teacher_insert_own_attendance" on public.attendance;
create policy "teacher_insert_own_attendance"
on public.attendance
for insert
to authenticated
with check (
  teacher_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "teacher_update_own_attendance" on public.attendance;
create policy "teacher_update_own_attendance"
on public.attendance
for update
to authenticated
using (
  teacher_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
)
with check (
  teacher_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);

drop policy if exists "teacher_delete_own_attendance" on public.attendance;
create policy "teacher_delete_own_attendance"
on public.attendance
for delete
to authenticated
using (
  teacher_user_id = auth.uid()
  or exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  )
);