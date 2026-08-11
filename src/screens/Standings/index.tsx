import { EmptyState } from '@/components/ui/EmptyState';
import { Screen } from '@/components/ui/Screen';
export function StandingsScreen() {
  return (
    <Screen>
      <EmptyState
        title={"No standings yet"}
        body={"Placings become points the moment the last team runs, on whatever scale the producer published."}
      />
    </Screen>
  );
}
