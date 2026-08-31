// src/screens/Team/index.tsx
//
// Your outfit.
//
// Ranch rodeo is the only event in this portfolio scored as a team across a
// card of events rather than as an individual run, so "who am I riding with"
// is a first-class question rather than a detail on an entry.
//
// It reads through `buddy_groups`, which is what the schema already uses to
// keep people who travel together running together. That is not a perfect fit
// for a ranch rodeo team — a buddy group is a scheduling device and a team is
// a competitive unit — and the difference is stated rather than papered over,
// because a producer who assumed the app tracked their roster would be
// surprised at the wrong moment.

import { useQuery } from '@tanstack/react-query';
import { Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { Screen } from '@/components/ui/Screen';
import { Stat } from '@/components/ui/Stat';
import { colors } from '@/constants/theme';
import { useSession } from '@/lib/auth';
import { getMyProfile, listMyEntries, type MyEntry } from '@/lib/queries';

export function TeamScreen() {
  const { user } = useSession();

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getMyProfile(user!.id),
    enabled: Boolean(user?.id),
  });
  const profileId = profileQuery.data?.id;

  const entriesQuery = useQuery({
    queryKey: ['entries', profileId],
    queryFn: () => listMyEntries(profileId!),
    enabled: Boolean(profileId),
  });

  const entries = entriesQuery.data ?? [];
  const live = entries.filter(
    (e: MyEntry) =>
      !['scratched', 'turned_out', 'no_show', 'cancelled'].includes(e.status) &&
      e.rodeos !== null &&
      !['settled', 'cancelled'].includes(e.rodeos.status),
  );

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '700' }}>Your team</Text>
        <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>
          Ranch rodeo is scored as an outfit across a card of events, so what matters here is the
          run order and where you have to be, not an individual time.
        </Text>
      </View>

      <QueryBoundary
        isLoading={profileQuery.isLoading || entriesQuery.isLoading}
        error={profileQuery.error ?? entriesQuery.error}
        data={live}
        onRetry={() => entriesQuery.refetch()}
        empty={
          <EmptyState
            title="Not entered anywhere"
            body="Enter a ranch rodeo and your team's draw position and performance show up here. Until then there is nothing to be late for."
          />
        }
      >
        {(rows) => (
          <View style={{ gap: 12 }}>
            {rows.map((entry) => {
              const rodeo = entry.rodeos;
              const when = rodeo
                ? new Date(`${rodeo.start_date}T00:00:00`).toLocaleDateString()
                : '';
              return (
                <Card
                  key={entry.id}
                  title={rodeo?.name ?? 'Ranch rodeo'}
                  subtitle={[when, [rodeo?.venue_city, rodeo?.venue_state].filter(Boolean).join(', ')]
                    .filter(Boolean)
                    .join(' · ')}
                >
                  <View style={{ flexDirection: 'row', gap: 24, flexWrap: 'wrap' }}>
                    <Stat
                      label="Draw"
                      value={entry.draw_position ? String(entry.draw_position) : '—'}
                      hint={entry.draw_position ? undefined : 'Not posted'}
                    />
                    {entry.performance_number ? (
                      <Stat label="Perf" value={String(entry.performance_number)} />
                    ) : null}
                    <Stat label="Status" value={entry.status} />
                  </View>
                </Card>
              );
            })}
          </View>
        )}
      </QueryBoundary>

      <Card
        title="On team rosters"
        subtitle={
          'The app tracks the entry, not the roster: it knows your team is entered and where you run, and it does not yet hold a list of who rides on it. ' +
          'A ranch rodeo team is a competitive unit with roles — the schema models travel partners, which is a scheduling device and not the same thing. ' +
          'Saying so here beats a screen that looks like a roster and quietly is not one.'
        }
      />
    </Screen>
  );
}
