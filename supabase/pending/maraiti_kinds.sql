-- Run once (SQL editor) to let «مرايتي» prepare the new draft kinds (migration 0181 already executes them).
alter table public.maraiti_actions drop constraint if exists maraiti_actions_kind_check;
alter table public.maraiti_actions add constraint maraiti_actions_kind_check check (kind in (
  'book_appointment', 'send_client_message', 'reschedule', 'remind_me',
  'cancel_appointment', 'add_patient', 'write_session_note', 'reply_written_consult', 'reply_mira_thread', 'mark_intake_reviewed'));
