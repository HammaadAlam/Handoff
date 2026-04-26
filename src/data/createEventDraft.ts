export type CreateEventDraft = {
  title: string;
  description: string;
  locationLabel: string;
  imageUri: string;
  startsAt: string;
  endsAt: string;
};

function buildDefaultStartsAtIso() {
  const nextHour = new Date();
  nextHour.setMinutes(0, 0, 0);
  nextHour.setHours(nextHour.getHours() + 1);
  return nextHour.toISOString();
}

function buildDefaultEndsAtIso(startsAtIso: string) {
  const starts = new Date(startsAtIso);
  starts.setHours(starts.getHours() + 1);
  return starts.toISOString();
}

const defaultStartsAt = buildDefaultStartsAtIso();

export const DEFAULT_CREATE_EVENT_DRAFT: CreateEventDraft = {
  title: '',
  description: '',
  locationLabel: '',
  imageUri: '',
  startsAt: defaultStartsAt,
  endsAt: buildDefaultEndsAtIso(defaultStartsAt),
};

export function mergeCreateEventDraft(
  draft?: Partial<CreateEventDraft>,
): CreateEventDraft {
  return {
    ...DEFAULT_CREATE_EVENT_DRAFT,
    ...draft,
  };
}
