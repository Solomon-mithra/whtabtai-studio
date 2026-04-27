-- Each statement is individually idempotent. The migration runner splits
-- on semicolons, so do not include semicolons inside comments.

delete from sources s1 using sources s2 where s1.kind = s2.kind and s1.url = s2.url and s1.id > s2.id;

create unique index if not exists sources_kind_url_uniq on sources (kind, url);
