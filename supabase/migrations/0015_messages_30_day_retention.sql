-- Keep inbox message history to a rolling 30-day window.
-- Enforced in-database so retention applies regardless of client.

create or replace function public.prune_messages_older_than_30_days()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.messages
  where created_at < (now() - interval '30 days');
  return null;
end;
$$;

drop trigger if exists trg_prune_messages_older_than_30_days on public.messages;
create trigger trg_prune_messages_older_than_30_days
after insert on public.messages
for each statement
execute function public.prune_messages_older_than_30_days();
