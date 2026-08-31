// src/screens/Standings/index.tsx
//
// Season standings.
//
// Reads `public_standings`, which aggregates `public_results` — the single
// place a contestant's name crosses out of the private tables, and only for
// official placings at a rodeo that is already under way. So nothing on this
// screen can expose anything the scoreboard was not already publishing, and
// there is exactly one view to audit rather than a join per screen.

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { QueryBoundary } from '@/components/ui/QueryBoundary';
import { Screen } from '@/components/ui/Screen';
import { colors, radius } from '@/constants/theme';
import { useSession } from '@/lib/auth';
import { getMyProfile, listStandings, type Standing } from '@/lib/queries';

function money(cents: number | null): string {
  if (cents === null) return '$0';
  return `$${Number(cents).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function Row({
  standing,
  place,
  isMe,
}: {
  standing: Standing;
  place: number;
  isMe: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        paddingVertical: 12,
        paddingHorizontal: 14,
        borderRadius: radius.control,
        // Finding yourself in a long list is the whole reason somebody opens
        // this screen.
        backgroundColor: isMe ? colors.card : 'transparent',
        borderWidth: isMe ? 1 : 0,
        borderColor: colors.accent,
      }}
    >
      <Text style={{ color: colors.muted, fontSize: 13, width: 28 }}>{place}</Text>
      <Text style={{ color: colors.text, fontSize: 15, flex: 1, fontWeight: isMe ? '700' : '400' }}>
        {standing.first_name} {standing.last_name}
      </Text>
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{ color: colors.accent, fontSize: 15, fontWeight: '600' }}>
          {money(standing.total_earnings)}
        </Text>
        <Text style={{ color: colors.muted, fontSize: 11 }}>
          {standing.rodeos_entered ?? 0} rodeos
        </Text>
      </View>
    </View>
  );
}

export function StandingsScreen() {
  const { user } = useSession();
  const [season, setSeason] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => getMyProfile(user!.id),
    enabled: Boolean(user?.id),
  });

  const standingsQuery = useQuery({
    queryKey: ['standings'],
    queryFn: listStandings,
  });

  const all = standingsQuery.data ?? [];
  const seasons = [...new Set(all.map((s) => s.season).filter(Boolean))].sort().reverse();
  const active = season ?? seasons[0] ?? null;
  const rows = active ? all.filter((s) => s.season === active) : all;

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <Text style={{ color: colors.text, fontSize: 26, fontWeight: '700' }}>Standings</Text>
        <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 21 }}>
          Official placings only, and only from rodeos already under way. A practice run can never
          appear here.
        </Text>
      </View>

      {seasons.length > 1 ? (
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {seasons.map((s) => (
            <Pressable
              key={s}
              onPress={() => setSeason(s)}
              style={{
                borderColor: s === active ? colors.accent : colors.border,
                borderWidth: 1,
                borderRadius: radius.pill,
                paddingHorizontal: 14,
                paddingVertical: 6,
              }}
            >
              <Text style={{ color: s === active ? colors.accent : colors.muted, fontSize: 13 }}>
                {s}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      <QueryBoundary
        isLoading={standingsQuery.isLoading}
        error={standingsQuery.error}
        data={rows}
        onRetry={() => standingsQuery.refetch()}
        empty={
          <EmptyState
            title="No standings yet"
            body="Standings build from official results as producers close their books. Nothing is posted here until a rodeo is finished and filed."
          />
        }
      >
        {(list) => (
          <Card title={active ? `${active} season` : 'All seasons'}>
            <View style={{ gap: 2 }}>
              {list.map((standing, i) => (
                <Row
                  key={`${standing.contestant_id}-${standing.event_type}`}
                  standing={standing}
                  place={i + 1}
                  isMe={standing.contestant_id === profileQuery.data?.id}
                />
              ))}
            </View>
          </Card>
        )}
      </QueryBoundary>
    </Screen>
  );
}
